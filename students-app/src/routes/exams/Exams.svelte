<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { navigate } from "svelte-navigator";
    import Swal from "sweetalert2";
    import Loader from "../../Loader.svelte";
    import { usernameStore, identityStore } from "../../stores/identity";
    import { examStore } from "../../stores/exam";

    let isLoading: boolean = false;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let exams = [];

    const fireError = (err) =>
        Swal.fire({
            title: "Error!",
            text: err,
            icon: "error",
            confirmButtonText: "Ok",
        });

    onMount(async () => {
        isLoading = true;
        try {
            const res = await fetch("http://localhost:10000/students/exams/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: identityString,
                    username,
                }),
            });
            if (res.ok) {
                const apiRes = await res.json();
                const examArr: Record<string, any>[] = apiRes.exams;
                console.log(apiRes.exams);
                exams = examArr.map((e) => ({
                    ID: e.ID,
                    Date: e.Date,
                    Duration: e.Duration,
                    Title: e.Title,
                    Subject: e.Subject,
                    Live: e.Live == "1",
                    Examiner: e.Examiner,
                }));
            } else {
                const r = await res.json();
                fireError(`Error occurred: ${r.error}`);
            }
        } catch (err) {
            fireError(`Couldn't load exams: ${err}`);
        } finally {
            isLoading = false;
        }
    });

    const getExamDetails = (exam: Exam) => {
        examStore.set(exam);
        navigate(`/exams/${exam.ID}`);
    };

    const getResults = (exam: Exam) => {
        navigate(`/exams/${exam.ID}/results`,  {
            state: {
                examId: exam.ID,
            },
        });
    };
</script>

<div class="h-full flex flex-col items-center">
    {#if isLoading}
        <div class="flex flex-col items-center justify-center">
            <Loader stroke="#fff" />
        </div>
    {:else}
        <div class="my-5 sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block sm:px-6 lg:px-8">
                <div
                    class="shadow-2xl overflow-hidden border-b border-gray-200 sm:rounded-lg"
                >
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    ID
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Date
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Duration
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Title
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Subject
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Examiner
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Details
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Results
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each exams as exam}
                                <tr>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {exam.ID}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {new Date(exam.Date).toLocaleString()}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {exam.Duration}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {exam.Title}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {exam.Subject}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {exam.Examiner}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-indigo-600 hover:text-indigo-900"
                                    >
                                        <button
                                            on:click={() =>
                                                getExamDetails(exam)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-indigo-600 hover:text-indigo-900"
                                    >
                                        <button
                                            on:click={() => getResults(exam)}
                                        >
                                            Results
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    {/if}
</div>
