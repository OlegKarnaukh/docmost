import React, { useEffect, useMemo } from "react";
import {
  AppShell,
  Box,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { useGetSharedPageTreeQuery } from "@/features/share/queries/share-query.ts";
import { useParams } from "react-router-dom";
import SharedTree from "@/features/share/components/shared-tree.tsx";
import { useSetAtom } from "jotai";
import { useAtom } from "jotai";
import { sharedPageTreeAtom, sharedTreeDataAtom } from "@/features/share/atoms/shared-page-atom";
import { buildSharedPageTree } from "@/features/share/utils";
import {
  desktopSidebarAtom,
  mobileSidebarAtom,
} from "@/components/layouts/global/hooks/atoms/sidebar-atom.ts";
import { useTranslation } from "react-i18next";
import { useToggleSidebar } from "@/components/layouts/global/hooks/hooks/use-toggle-sidebar.ts";
import SidebarToggle from "@/components/ui/sidebar-toggle-button.tsx";
import classes from "./share.module.css";
import { ShareSearchSpotlight } from "@/features/search/components/share-search-spotlight.tsx";
import { shareSearchSpotlight } from "@/features/search/constants";
import { IconSearch, IconBook } from "@tabler/icons-react";

const MemoizedSharedTree = React.memo(SharedTree);

export default function ShareShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [mobileOpened] = useAtom(mobileSidebarAtom);
  const [desktopOpened] = useAtom(desktopSidebarAtom);
  const toggleMobile = useToggleSidebar(mobileSidebarAtom);
  const toggleDesktop = useToggleSidebar(desktopSidebarAtom);

  const { shareId } = useParams();
  const { data } = useGetSharedPageTreeQuery(shareId);

  // @ts-ignore
  const setSharedPageTree = useSetAtom(sharedPageTreeAtom);
  // @ts-ignore
  const setSharedTreeData = useSetAtom(sharedTreeDataAtom);

  // Build and set the tree data when it changes
  const treeData = useMemo(() => {
    if (!data?.pageTree) return null;
    return buildSharedPageTree(data.pageTree);
  }, [data?.pageTree]);

  useEffect(() => {
    setSharedPageTree(data || null);
    setSharedTreeData(treeData);
  }, [data, treeData, setSharedPageTree, setSharedTreeData]);

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: {
          mobile: !mobileOpened,
          desktop: !desktopOpened,
        },
      }}
      padding="md"
    >
      <AppShell.Navbar p="md" className={classes.navbar}>
        {/* Header with title */}
        <Box mb="md">
          <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <IconBook size={24} stroke={1.5} />
            <Text size="lg" fw={600}>Олег Карнаух</Text>
          </Box>
        </Box>

        {/* Search input */}
        {shareId && (
          <Box mb="md">
            <TextInput
              placeholder={t("Search...")}
              leftSection={<IconSearch size={16} />}
              onClick={shareSearchSpotlight.open}
              readOnly
              style={{ cursor: "pointer" }}
            />
          </Box>
        )}

        {/* Page tree */}
        <ScrollArea style={{ flex: 1 }} scrollbarSize={5}>
          {data?.pageTree?.length >= 1 && (
            <MemoizedSharedTree sharedPageTree={data} />
          )}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box mb="sm">
          <SidebarToggle
            aria-label={t("Toggle sidebar")}
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />

          <SidebarToggle
            aria-label={t("Toggle sidebar")}
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
        </Box>
        {children}
      </AppShell.Main>

      <ShareSearchSpotlight shareId={shareId} />
    </AppShell>
  );
}
