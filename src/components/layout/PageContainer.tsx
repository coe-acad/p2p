import { ReactNode } from "react";
import { Container, Stack, ContainerProps } from "@mui/material";

interface PageContainerProps extends Partial<ContainerProps> {
  children: ReactNode;
  gap?: number;
  className?: string;
}

export const PageContainer = ({
  children,
  gap = 4,
  className = "",
  maxWidth = "md",
  ...props
}: PageContainerProps) => {
  return (
    <Container
      maxWidth={maxWidth}
      {...props}
      sx={{
        py: { xs: 2, sm: 3, lg: 4 },
        ...props.sx,
      }}
    >
      <Stack gap={gap} {...props}>
        {children}
      </Stack>
    </Container>
  );
};

export default PageContainer;
