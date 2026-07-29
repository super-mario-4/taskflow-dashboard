const Logo = () => {
    return (
        <div className="flex items-center gap-3">
            <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="20"
                    cy="20"
                    r="20"
                    className="fill-slate-950 dark:fill-white"
                />

                {/* T */}
                <path
                    d="M13 12H27V15H22V28H18V15H13V12Z"
                    className="fill-white dark:fill-slate-950"
                />

                {/* Check */}
                <path
                    d="M16 21L19 24L25 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white dark:text-slate-950"
                />
            </svg>

            <span className="text-xl font-bold tracking-tight text-foreground">
                TaskFlow
            </span>
        </div>
    );
};

export default Logo;
