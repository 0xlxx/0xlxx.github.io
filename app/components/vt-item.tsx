interface VTItemProps {
  prefix: string
  children: React.ReactNode
}

export function VTItem(props: VTItemProps) {
  const getTransitionName = (children: React.ReactNode): string => {
    const str =  typeof children === 'string' ? children : ''
    return str.replace(/[^a-zA-Z0-9]/g, '_')
  }

  return (
    <span
      // style={{ viewTransitionName: `${props.prefix}-${getTransitionName(props.children)}` }}
    >
      {props.children}
    </span>
  )
}
