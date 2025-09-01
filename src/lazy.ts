import { lazy } from "solid-js";

export const AlleyFlex = lazy(
  () => import("alley-components/lib/components/flex"),
);

export const AlleyInput = lazy(
  () => import("alley-components/lib/components/input"),
);
export const AlleyTextArea = lazy(
  () => import("alley-components/lib/components/input/text-area"),
);

export const AlleyButton = lazy(
  () => import("alley-components/lib/components/button"),
);

export const AlleyCol = lazy(
  () => import("alley-components/lib/components/col"),
);

export const AlleyRow = lazy(
  () => import("alley-components/lib/components/row"),
);

export const AlleyDivider = lazy(
  () => import("alley-components/lib/components/divider"),
);

export const AlleySpace = lazy(
  () => import("alley-components/lib/components/space"),
);
export const AlleySpaceCompact = lazy(
  () => import("alley-components/lib/components/space/compact"),
);

export const AlleyTooltip = lazy(
  () => import("alley-components/lib/components/tooltip"),
);

export const AlleyTypography = lazy(
  () => import("alley-components/lib/components/typography"),
);

export const AlleyText = lazy(
  () => import("alley-components/lib/components/typography/text"),
);

export const AlleyTag = lazy(
  () => import("alley-components/lib/components/tag"),
);

export const AlleyDialog = lazy(
  () => import("alley-components/lib/components/dialog"),
);

export const AlleyLabel = lazy(
  () => import("alley-components/lib/components/label"),
);

export const AlleyToast = lazy(
  () => import("alley-components/lib/components/toast"),
);

export const AlleyAlert = lazy(
  () => import("alley-components/lib/components/alert"),
);

export const AlleyDropDown = lazy(
  () => import("alley-components/lib/components/dropdown"),
);

export const AlleySwitch = lazy(
  () => import("alley-components/lib/components/switch"),
);

export const LazyFlex = lazy(() => import("~/components/Flex/Flex"));

// --- fluentui ---

export const LazyButton = lazy(
  () => import("fluent-solid/lib/components/button"),
);

export const LazyInput = lazy(
  () => import("fluent-solid/lib/components/input"),
);

export const LazyBadge = lazy(
  () => import("fluent-solid/lib/components/badge"),
);

export const LazyTooltip = lazy(
  () => import("fluent-solid/lib/components/tooltip"),
);

export const LazyLabel = lazy(
  () => import("fluent-solid/lib/components/label"),
);

export const LazyCard = lazy(
  () => import("fluent-solid/lib/components/card/Card"),
);

export const LazyCardHeader = lazy(
  () => import("fluent-solid/lib/components/card/CardHeader"),
);

export const LazyCardPreview = lazy(
  () => import("fluent-solid/lib/components/card/CardPreview"),
);

export const LazyCardFooter = lazy(
  () => import("fluent-solid/lib/components/card/CardFooter"),
);

export const LazySpinner = lazy(
  () => import("fluent-solid/lib/components/spinner"),
);

export const LazyText = lazy(
  () => import("fluent-solid/lib/components/text/Text"),
);

export const LazyTextCaption1 = lazy(
  () => import("fluent-solid/lib/components/text/Caption1"),
);

export const LazyTextArea = lazy(
  () => import("fluent-solid/lib/components/textarea"),
);

export const LazyField = lazy(
  () => import("fluent-solid/lib/components/field"),
);
