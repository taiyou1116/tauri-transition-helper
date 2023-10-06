type ButtonProps = {
    onClick?: () => void,
    text?: string,
    type?: 'submit' | 'button',
    variant?: Variant,
    className?: string,
}

const variants = {
    default:
      'bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 shadow-lg shadow-slate-400 active:translate-y-1 active:shadow-none flex items-center justify-center',
    primary:
      'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 shadow-lg shadow-slate-400 active:translate-y-1 active:shadow-none flex items-center justify-center',
    danger:
      'bg-red-300 border-red-400 dark:bg-red-500 dark:border-red-600 hover:bg-red-400 hover:border-red-500 hover:dark:bg-red-600 hover:dark:border-red-700 hover:text-white',
    success:
      'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 shadow-lg shadow-slate-400 active:translate-y-1 active:shadow-none flex items-center justify-center',
    ghost:
      'bg-transparent border-transparent hover:bg-gray-200 hover:border hover:border-gray-300 hover:dark:bg-transparent hover:dark:border-slate-700 shadow-none',
};

// kryof typeof でプロパティのキーを文字列リテラル型で取得する(default...ghost)
type Variant = keyof typeof variants;

export default function Button(props: ButtonProps) {
    const { onClick, text, type, variant, className } = props;

    const classes = ` ${variant ? variants[variant] : variants.default} ${className}`;

    return (
        <button
          type={type ?? 'button'}
          className={classes ?? ''}
          onClick={onClick ? () => onClick() : undefined}
        >
          <span>{text}</span>
        </button>
    )
}