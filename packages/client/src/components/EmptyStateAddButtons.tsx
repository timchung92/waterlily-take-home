function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export type EmptyStateAddOptionDef = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  background: string;
  onClick: () => void;
};

export default function EmptyStateAddButtons({
  className,
  addOptions,
  title,
  description,
  forModal,
}: {
  className?: string;
  title?: string;
  description?: string;
  addOptions: EmptyStateAddOptionDef[];
  forModal?: boolean;
}) {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-lg font-semibold leading-6 text-gray-900">
          {title}
        </h2>
      )}
      {description && (
        <p className="mt-1 text-base text-gray-500">{description}</p>
      )}
      <ul
        className={`mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 py-6 ${forModal ? '' : ' sm:grid-cols-2'}`}
      >
        {addOptions.map((item, itemIdx) => (
          <li
            key={itemIdx}
            className="flow-root cursor-pointer"
          >
            <div className="relative -m-2 flex items-center space-x-4 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 hover:bg-gray-50">
              <div
                className={classNames(
                  item.background,
                  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg md:h-16 md:w-16',
                )}
              >
                <item.icon
                  aria-hidden="true"
                  className="h-5 w-5 text-white md:h-6 md:w-6"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  <a
                    onClick={item.onClick}
                    className="focus:outline-none"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                    />
                    <span className="text-sm md:text-base">{item.title}</span>
                    <span aria-hidden="true"> &rarr;</span>
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-500 md:text-base">
                  {item.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
