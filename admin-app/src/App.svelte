<script lang="ts">
    import { Router, Link, Route } from "svelte-navigator";
    import Login from "./routes/Login.svelte";
    import NewExaminer from "./routes/NewExaminer.svelte";
    import NewStudent from "./routes/NewStudent.svelte";
    let open = true;
    matchMedia("(min-width: 1024px)").addEventListener("change", (mq) => {
        if (mq.matches) {
            open = true;
        }
    });
</script>

<body class="flex flex-col text-white h-screen">
    <Router>
        <nav
            class="relative flex flex-wrap items-center justify-between px-2 ease-linear transition-all duration-150"
        >
            <div
                class="container px-4 mx-auto flex flex-wrap items-center justify-between"
            >
                <div
                    class="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start"
                >
                    <Link
                        class="text-xl font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap"
                        to="/"
                    >
                        ExamNet
                    </Link>
                    <button
                        class="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
                        on:click={() => {
                            open = !open;
                        }}
                        type="button"
                    >
                        <span
                            class="block relative w-6 h-px rounded-sm bg-white"
                        />
                        <span
                            class="block relative w-6 h-px rounded-sm bg-white mt-1"
                        />
                        <span
                            class="block relative w-6 h-px rounded-sm bg-white mt-1"
                        />
                    </button>
                </div>
                {#if open}
                    <div
                        class="lg:flex flex-grow items-center"
                        id="example-navbar-warning"
                    >
                        <ul class="flex flex-col lg:flex-row list-none ml-auto">
                            <li class="nav-item">
                                <Link
                                    class="px-3 py-2 flex items-center text-md uppercase font-bold leading-snug text-white hover:opacity-75"
                                    to="/"
                                >
                                    Login
                                </Link>
                            </li>
                            <li class="nav-item">
                                <Link
                                    class="px-3 py-2 flex items-center text-md uppercase font-bold leading-snug text-white hover:opacity-75"
                                    to="/examiners"
                                >
                                    Add Examiner
                                </Link>
                            </li>
                            <li class="nav-item">
                                <Link
                                    class="px-3 py-2 flex items-center text-md uppercase font-bold leading-snug text-white hover:opacity-75"
                                    to="/students"
                                >
                                    Add Student
                                </Link>
                            </li>
                        </ul>
                    </div>
                {/if}
            </div>
        </nav>
        <main class="flex-grow mx-1">
            <Route path="/" component={Login} />
            <Route path="/examiners" component={NewExaminer} />
            <Route path="/students" component={NewStudent} />
        </main>
    </Router>
</body>

<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    @tailwind variants;
    body {
        background: linear-gradient(
            to right,
            #7400b8,
            #6930c3,
            #5e60ce,
            #5390d9,
            #4ea8de,
            #48bfe3,
            #56cfe1,
            #64dfdf,
            #72efdd
        );
        background-size: 200% 110%;
        background-repeat: no-repeat;
        animation: gradient 40s ease infinite;
    }

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 90% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
</style>
