import clsx from 'clsx'

/**
 * Reusable panel frame used across the app with a cool premium glass style.
 */
export default function Glass3DFrame({ children, className, padded = true, glow = false, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={clsx(
        'glass-panel corner-frame relative',
        glow && 'shadow-[0_22px_60px_rgba(38,58,67,0.12),0_8px_22px_rgba(31,42,48,0.08)]',
        padded && 'p-5',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
