<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../stores/identity";

    export let examId: string;
    let isLoading: boolean = true;
    let exam: Exam;
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

    onMount(fetchData);
</script>

<main>
    {#if isLoading}
        <p>Loading...</p>
    {:else}
        <h1>All Exams</h1>
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
            </tr>
            <tr>
                <td>{exam.ID}</td>
                <td>{exam.Date}</td>
                <td>{exam.Duration}</td>
                <td>{exam.Title}</td>
                <td>{exam.Subject}</td>
                <td>{exam.Live ? "Yes" : "No"}</td>
                <td>{exam.Examiner}</td>
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
            </tr>
        </table>
    {/if}
</main>
