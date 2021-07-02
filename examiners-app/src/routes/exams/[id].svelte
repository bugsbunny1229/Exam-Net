<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../stores/identity";

    export let examId: string;
    let isLoading: boolean = true;
    let exam: Exam;
    let editMode: boolean = false;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);

    const fetchData = async () => {
        const res = await fetch(`http://localhost:10000/exams/${examId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: identityString,
                username,
            }),
        });
        const examRes = (await res.json()).exam;
        exam = {
            ID: examRes.ID,
            Date: new Date(examRes.Date),
            Duration: examRes.Duration,
            Title: examRes.Title,
            Subject: examRes.Subject,
            Live: examRes.Live == "1",
            Examiner: examRes.Examiner,
            Password: examRes.Password,
            Address: examRes.Address,
        };
        isLoading = false;
    };

    const onClick = async (mode: string) => {
        isLoading = true;
        const res = await fetch(
            `http://localhost:10000/exams/${examId}/${mode}`,
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
        console.log(await res.json());
        await fetchData();
        isLoading = false;
    };

    const deleteExam = async () => {
        isLoading = true;
        const res = await fetch(
            `http://localhost:10000/exams/${examId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: identityString,
                    username,
                }),
            }
        );
        console.log(await res.json());
        await fetchData();
        isLoading = false;
    };

    onMount(fetchData);
</script>

<main>
    {#if isLoading}
        <p>Loading...</p>
    {:else}
        <h1>Exam: {exam.Title}</h1>
        <table>
            <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Title</th>
                <th>Subject</th>
                <th>Live</th>
                <th>Examiner</th>
                <th>Schedule</th>
                <th>Cancel</th>
                <th>Delete</th>
                <th>Edit</th>
            </tr>
            <tr>
                <td><input type="text" value="{exam.ID}" readonly={editMode} /></td>
                <td><input type="datetime" value="{exam.Date.toDateString()}" readonly={editMode} /></td>
                <td><input type="number" value={exam.Duration} readonly={editMode} /></td>
                <td><input type="text" value="{exam.Title}" readonly={editMode} /></td>
                <td><input type="text" value="{exam.Subject}" readonly={editMode} /></td>
                <td><input type="checkbox" checked={exam.Live} readonly={editMode} /></td>
                <td><input type="text" value="{exam.Examiner}" readonly={editMode} /></td>
                <td>
                    <button
                        disabled={exam.Live}
                        on:click={() => onClick("schedule")}
                    >Schedule Exam
                    </button>
                </td>
                <td>
                    <button
                        disabled={!exam.Live}
                        on:click={() => onClick("cancel")}
                    >Cancel Exam
                    </button>
                </td>
                <td>
                    <button on:click={deleteExam}>Delete Exam</button>
                </td>
                <td>
                    <button on:click={() => {editMode = !editMode}}>Edit Exam</button>
                </td>
            </tr>
        </table>
    {/if}
</main>
