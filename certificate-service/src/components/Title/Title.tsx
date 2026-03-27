

interface TitleProps {
    children: string;
    type?: string;
}
export const Title = ({ children, type }: TitleProps) => {
    switch (type) {
      case 'h2':
        return <h2 className="clr-blue-main umb24">{children}</h2>
      case 'h3':
        return <h3 className="clr-blue-main">{children}</h3>
      default:
        return <h2 className="clr-blue-main umb24">{children}</h2>
    }
}
