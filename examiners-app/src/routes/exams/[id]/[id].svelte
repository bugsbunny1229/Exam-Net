<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { Link, navigate } from "svelte-navigator";
    import { usernameStore, identityStore } from "../../../stores/identity";

    export let examId: string;
    let isLoading: boolean = true;
    let exam: Exam;
    let editMode: boolean = false;
    let title: string;
    let subject: string;
    let duration: number;
    let date: string;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);

    const fetchData = async () => {
        const res = await fetch(`http://localhost:10000/examiners/exams/${examId}`, {
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
            Date: examRes.Date,
            Duration: examRes.Duration,
            Title: examRes.Title,
            Subject: examRes.Subject,
            Live: examRes.Live == "1",
            Examiner: examRes.Examiner,
            Password: examRes.Password,
            Address: examRes.Address,
        };
        title = exam.Title;
        date = exam.Date;
        duration = exam.Duration;
        subject = exam.Subject;
        isLoading = false;
    };

    const cancelExam = async () => {
        isLoading = true;
        await fetch(`http://localhost:10000/examiners/exams/${examId}/cancel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: identityString,
                username,
            }),
        });
        await fetchData();
        isLoading = false;
    };

    const deleteExam = async () => {
        isLoading = true;
        await fetch(`http://localhost:10000/examiners/exams/${examId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: identityString,
                username,
            }),
        });
        navigate("/exams", { replace: true });
        isLoading = false;
    };

    const updateExam = async () => {
        isLoading = true;
        await fetch(`http://localhost:10000/examiners/exams/${examId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: identityString,
                username,
                title,
                subject,
                duration,
                date,
            }),
        });
        await fetchData();
        isLoading = false;
    };
    // TODO: add password in request body for API call

    onMount(fetchData);
</script>

<main>
    <!-- TODO: add password field for scheduling -->
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
                <th>Answer Sheets</th>
                <th>Delete</th>
                <th>Edit</th>
            </tr>
            <tr>
                <td>
                    <input type="text" value={exam.ID} readonly />
                </td>
                <td>
                    <input
                        type="datetime-local"
                        value={exam.Date}
                        on:input={(d) => (date = d.target.value)}
                        readonly={!editMode}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        value={exam.Duration}
                        on:input={(d) => (duration = Number(d.target.value))}
                        readonly={!editMode}
                    />
                </td>
                <td>
                    <input
                        type="text"
                        value={exam.Title}
                        on:input={(t) => (title = t.target.value)}
                        readonly={!editMode}
                    />
                </td>
                <td>
                    <input
                        type="text"
                        value={exam.Subject}
                        on:input={(s) => (subject = s.target.value)}
                        readonly={!editMode}
                    />
                </td>
                <td>
                    <input type="checkbox" checked={exam.Live} disabled />
                </td>
                <td>
                    <input type="text" value={exam.Examiner} readonly />
                </td>
                <td>
                    <Link to={`/exams/${examId}/schedule`}>Schedule</Link>
                </td>
                <td>
                    <button disabled={!exam.Live} on:click={cancelExam}>
                        Cancel Exam
                    </button>
                </td>
                abc
                <td>
                    <Link to={`/exams/${examId}/answer-sheets`}>Answer Sheets</Link>
                </td>
                <td>
                    <button on:click={deleteExam}> Delete Exam </button>
                </td>
                <td>
                    <button
                        on:click={() => {
                            editMode = !editMode;
                        }}
                    >
                        Edit Exam
                    </button>
                </td>
            </tr>
        </table>
        <button disabled={!editMode} on:click={updateExam}>Submit</button>
    {/if}
</main>
