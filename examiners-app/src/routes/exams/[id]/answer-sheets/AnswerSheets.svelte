<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { navigate } from "svelte-navigator";
    import { answerSheetStore } from "../../../../stores/answerSheet";
    import { usernameStore, identityStore } from "../../../../stores/identity";

    export let examId: string;
    let isLoading: boolean = false;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let answerSheets: AnswerSheet[] = [];

    onMount(async () => {
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
            const answerSheetArr: Record<string, any>[] = apiRes.answerSheets;
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
            alert(`Error occurred: ${r.error}`);
        }
        isLoading = false;
    });

    const onClick = (answerSheet) => {
        answerSheetStore.set(answerSheet);
        navigate(`/exams/${examId}/answer-sheets/${answerSheet.ID}`);
    };
</script>

<main>
    {#if isLoading}
        <p>Loading...</p>
    {:else}
        <h1>All Exams</h1>
        <table>
            <tr>
                <th>ID</th>
                <th>Exam ID</th>
                <th>Roll Number</th>
                <th>Key</th>
                <th>Address</th>
            </tr>
            {#each answerSheets as answerSheet}
                <tr>
                    <td>{answerSheet.ID}</td>
                    <td>{answerSheet.ExamID}</td>
                    <td>{answerSheet.RollNumber}</td>
                    <td>{answerSheet.Key}</td>
                    <td>{answerSheet.Address}</td>
                    <td>
                        <button on:click={() => onClick(answerSheet)}>
                            Details
                        </button>
                    </td>
                </tr>
            {/each}
        </table>
    {/if}
</main>
