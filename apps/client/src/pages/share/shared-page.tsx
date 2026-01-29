import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useSharePageQuery } from "@/features/share/queries/share-query.ts";
import { Anchor, Box, Breadcrumbs, Container, Text } from "@mantine/core";
import React, { useEffect, useMemo } from "react";
import ReadonlyPageEditor from "@/features/editor/readonly-page-editor.tsx";
import { extractPageSlugId } from "@/lib";
import { Error404 } from "@/components/ui/error-404.tsx";
import { useAtomValue } from "jotai";
import { sharedPageTreeAtom } from "@/features/share/atoms/shared-page-atom";
import { IconHome } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function SharedPage() {
  const { t } = useTranslation();
  const { pageSlug } = useParams();
  const { shareId } = useParams();
  const navigate = useNavigate();
  const sharedPageTree = useAtomValue(sharedPageTreeAtom);

  const { data, isLoading, isError, error } = useSharePageQuery({
    pageId: extractPageSlugId(pageSlug),
  });

  // Build breadcrumb path from current page to root
  const breadcrumbItems = useMemo(() => {
    if (!data?.page || !sharedPageTree?.pageTree) return [];

    const pageTree = sharedPageTree.pageTree;
    const currentPageId = data.page.id;

    // Create a map of pages by id for quick lookup
    const pageMap = new Map<string, { id: string; slugId: string; title: string; parentPageId: string }>();
    pageTree.forEach((page: any) => {
      if (page) {
        pageMap.set(page.id, {
          id: page.id,
          slugId: page.slugId,
          title: page.title || t("untitled"),
          parentPageId: page.parentPageId,
        });
      }
    });

    // Build path from current page to root
    const path: { id: string; slugId: string; title: string }[] = [];
    let currentId = currentPageId;

    while (currentId && pageMap.has(currentId)) {
      const page = pageMap.get(currentId)!;
      path.unshift({ id: page.id, slugId: page.slugId, title: page.title });
      currentId = page.parentPageId;
    }

    return path;
  }, [data?.page, sharedPageTree?.pageTree, t]);

  useEffect(() => {
    if (shareId && data) {
      if (data.share.key !== shareId) {
        navigate(`/share/${data.share.key}/p/${pageSlug}`, { replace: true });
      }
    }
  }, [shareId, data]);

  if (isLoading) {
    return <></>;
  }

  if (isError || !data) {
    if ([401, 403, 404].includes(error?.["status"])) {
      return <Error404 />;
    }
    return <div>{t("Error fetching page data.")}</div>;
  }

  return (
    <div>
      <Helmet>
        <title>{`${data?.page?.title || t("untitled")}`}</title>
        {!data?.share.searchIndexing && (
          <meta name="robots" content="noindex" />
        )}
      </Helmet>

      <Container size={900} p={0}>
        {/* Breadcrumbs */}
        {breadcrumbItems.length > 0 && (
          <Box mb="md" mt="sm">
            <Breadcrumbs
              separator="›"
              separatorMargin="xs"
              styles={{
                separator: { color: "var(--mantine-color-dimmed)" },
              }}
            >
              <Anchor
                component={Link}
                to={`/share/${shareId}`}
                c="dimmed"
                size="sm"
                style={{ display: "flex", alignItems: "center" }}
              >
                <IconHome size={16} />
              </Anchor>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return isLast ? (
                  <Text key={item.id} size="sm" c="dimmed">
                    {item.title}
                  </Text>
                ) : (
                  <Anchor
                    key={item.id}
                    component={Link}
                    to={`/share/${shareId}/p/${item.slugId}`}
                    c="dimmed"
                    size="sm"
                  >
                    {item.title}
                  </Anchor>
                );
              })}
            </Breadcrumbs>
          </Box>
        )}

        <ReadonlyPageEditor
          key={data.page.id}
          title={data.page.title}
          content={data.page.content}
          pageId={data.page.id}
        />
      </Container>
    </div>
  );
}
