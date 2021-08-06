<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { navigate } from "svelte-navigator";
    import Swal from "sweetalert2";
    import { answerSheetStore } from "../../../../stores/answerSheet";
    import Loader from "../../../../Loader.svelte";
    import { usernameStore, identityStore } from "../../../../stores/identity";

    export let examId: string;
    let isLoading: boolean = false;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let answerSheets: AnswerSheet[] = [
        // {
        //     ID: "1",
        //     ExamID: "abc",
        //     RollNumber: "2019BCS-023",
        //     Key: "key",
        //     Address: "address",
        // },
    ];

    const fireError = (err) =>
        Swal.fire({
            title: "Error!",
            text: err,
            icon: "error",
            confirmButtonText: "Ok",
        });

    onMount(async () => {
        try {
            isLoading = true;
            const res = await fetch(
                `http://localhost:10000/examiners/exams/${examId}/answer-sheets`,
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
                const answerSheetArr: Record<string, any>[] =
                    apiRes.answerSheets;
                console.log(apiRes.exams);
                answerSheets = answerSheetArr.map<AnswerSheet>((a) => ({
                    ID: a.ID,
                    Address: a.Address,
                    Key: a.Key,
                    RollNumber: a.RollNumber,
                    ExamID: a.ExamID,
                }));
            } else {
                const r = await res.json();
                fireError(`Error occurred: ${r.error}`);
            }
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
        }
    });

    const onClick = (answerSheet) => {
        answerSheetStore.set(answerSheet);
        navigate(`/exams/${examId}/answer-sheets/${answerSheet.ID}`);
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
                                    Roll Number
                                </th>
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each answerSheets as answerSheet}
                                <tr>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {answerSheet.ID}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        {answerSheet.RollNumber}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-gray-900"
                                    >
                                        <button
                                            on:click={() =>
                                                onClick(answerSheet)}
                                            class="px-6 py-4 whitespace-nowrap text-indigo-600 hover:text-indigo-900"
                                        >
                                            Details
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
