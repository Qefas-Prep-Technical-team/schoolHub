import { SidebarItem, Topic } from './types';

interface Props {
    items: SidebarItem[];
    topics: Topic[];
    onFilterChange: (filter: string) => void;
}

export default function Sidebar({ items, topics, onFilterChange }: Props) {
    return (
        <div className="sticky top-24">
            <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3 items-center">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCMTlwfk6DHG7C2eBDFBYYTinHQ9wcu0p564lP3QtR1-v_AKOJfGNqr3Qz_lNgrP6dpYSrKt1-IAVauJOgO6Tx9TQOsK6Tzo21oyrNCUXeQC2qtJB0tV3IF1ASnpRAMdu5HWSmsBDXn4ymHaKFKlKYRimLRemAtj8MkxAuqP1EOoxwW6rBg1T8jnjvgUDCjNz4cC86A1FSkxn6rVb-1PRohPFuJr4qNFAfBH2K4NHt73AFFtbCmH4a3LDmdXis3LIKIKGXTm2ukXGY")' }}
                            title="Class Discussions"
                        ></div>
                        <div className="flex flex-col">
                            <h1 className="text-slate-900 dark:text-white text-base font-semibold leading-normal">Discussions</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">PSY101</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                        {items.map((item) => (
                            <a
                                key={item.id}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${item.active
                                        ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                href="#"
                            >
                                <span className={`material-symbols-outlined text-2xl ${item.active ? 'fill' : ''}`}>
                                    {item.icon}
                                </span>
                                <p className={`text-sm ${item.active ? 'font-semibold' : 'font-medium'} leading-normal`}>
                                    {item.label}
                                </p>
                                {item.badge && (
                                    <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">
                                        {item.badge}
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>

                    <hr className="border-slate-200 dark:border-slate-800 my-2" />

                    <h3 className="text-slate-800 dark:text-slate-200 text-base font-semibold leading-tight px-3">Topics</h3>

                    <div className="flex gap-2 p-3 flex-wrap">
                        {topics.map((topic) => (
                            <button
                                key={topic.id}
                                onClick={() => onFilterChange(topic.name)}
                                className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-normal">
                                    {topic.name}
                                    {topic.count && ` (${topic.count})`}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}