<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import Swal from "sweetalert2";
    import Loader from "../../../Loader.svelte";
    import { usernameStore, identityStore } from "../../../stores/identity";

    export let examId: string;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let isLoading: boolean = false;
    let results: Result[] = [];

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
            const res = await fetch(
                `http://localhost:10000/examiners/results/exams/${examId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: identityString,
                        username,
                    }),
                }
            );
            if (res.ok) {
                const apiRes = await res.json();
                const resultsArr: Record<string, any>[] = apiRes.results;
                results = resultsArr.map<Result>((e) => ({
                    ID: e.ID,
                    Examiner: e.Examiner,
                    Address: e.Address,
                    Signature: e.Signature,
                    RollNumber: e.RollNumber,
                    AnswerSheetID: e.AnswerSheetID,
                    ExamID: e.ExamID,
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
                                    Answer Sheet ID
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Roll Number
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each results as result}
                                <tr>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {result.ID}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {result.AnswerSheetID}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {result.RollNumber}
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
