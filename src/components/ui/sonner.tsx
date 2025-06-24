
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-600 group-[.toast]:to-green-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-50 group-[.toast]:to-green-50 group-[.toast]:border-blue-200 group-[.toast]:text-blue-800",
          error: "group-[.toast]:bg-red-50 group-[.toast]:border-red-200 group-[.toast]:text-red-800",
          warning: "group-[.toast]:bg-orange-50 group-[.toast]:border-orange-200 group-[.toast]:text-orange-800",
          info: "group-[.toast]:bg-blue-50 group-[.toast]:border-blue-200 group-[.toast]:text-blue-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
