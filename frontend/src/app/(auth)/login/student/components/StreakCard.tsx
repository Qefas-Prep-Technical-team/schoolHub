export default function StreakCard() {
    return (
        <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-xl">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                    <p className="text-base font-bold text-[#0d121b] dark:text-white">
                        Welcome back! You`&apos;`re on a 5-day streak!
                    </p>
                    <p className="text-sm text-[#4c669a] dark:text-gray-300">
                        Keep up the great work and continue your learning journey.
                    </p>
                </div>
                <div
                    className="flex h-16 w-16 flex-none items-center justify-center rounded-lg bg-contain bg-center bg-no-repeat"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBvayKU77JikBl4gGBHSE1FnwtQPH1gV1p621TzoFmUvflz44RyZ80q8hHGH6u6ehiz3jeoYizG7QP3ZrGkY6JWL9WkpKK4yjF4x5Tp3FTYHG22PgWnTyWmhydtaUUaYKKY-HSovTl5wapg0vusajDa7ssPWpCG5q68YaFfY1zv70612V2gtVIV3yp0RxeCnBy3UtdKbsI12YTPHjxhUgDe1kpY5Hx8eiGg2EFja8mtJfwJQK1LF12UdrLc26qV_1JXkt_lydKFC_w")',
                    }}
                ></div>
            </div>
        </div>
    );
}
