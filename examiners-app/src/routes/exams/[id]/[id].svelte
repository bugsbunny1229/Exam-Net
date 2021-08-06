<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { Link, navigate } from "svelte-navigator";
    import Swal from "sweetalert2";
    import Loader from "../../../Loader.svelte";
    import { usernameStore, identityStore } from "../../../stores/identity";

    export let examId: string;
    let isLoading: boolean = true;
    // let exam: Exam = {
    //     ID: "1",
    //     Title: "Title",
    //     Date: "2019",
    //     Examiner: "Examiner",
    //     Subject: "Subject",
    //     Address: "address",
    //     Live: false,
    //     Duration: 100,
    //     Password: "password",
    // };
    let exam: Exam;
    let editMode: boolean = false;
    let title: string;
    let subject: string;
    let duration: number;
    let date: string;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);

    const fireError = (err) =>
        Swal.fire({
            title: "Error!",
            text: err,
            icon: "error",
            confirmButtonText: "Ok",
        });

    const fetchData = async () => {
        try {
            const res = await fetch(
                `http://localhost:10000/examiners/exams/${examId}`,
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
            } else {
                fireError(
                    `Could not fetch exam details: ${(await res.json()).error}`
                );
            }
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
        }
    };

    const cancelExam = async () => {
        try {
            isLoading = true;
            const res = await fetch(
                `http://localhost:10000/examiners/exams/${examId}/cancel`,
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
            if (res.ok) await fetchData();
            else
                fireError(`Failed to cancel exam: ${(await res.json()).error}`);
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
        }
    };

    const scheduleExam = async () => {
        const { value: password } = await Swal.fire({
            title: "Exam Password",
            input: "password",
            inputLabel: "Enter the exam password to schedule the exam",
            inputPlaceholder: "Enter password",
            inputAttributes: {
                autocapitalize: "off",
                autocorrect: "off",
            },
        });
        if (password) {
            try {
                isLoading = true;
                const res = await fetch(
                    `http://localhost:10000/examiners/exams/${examId}/schedule`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: identityString,
                            username,
                            password,
                        }),
                    }
                );
                if (res.ok) await fetchData();
                else
                    fireError(
                        `Failed to schedule exam: ${(await res.json()).error}`
                    );
            } catch (err) {
                fireError(err);
            } finally {
                isLoading = false;
            }
        }
    };

    const deleteExam = async () => {
        try {
            isLoading = true;
            const res = await fetch(
                `http://localhost:10000/examiners/exams/${examId}`,
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
            if (res.ok) navigate("/exams", { replace: true });
            else
                fireError(`Failed to delete exam: ${(await res.json()).error}`);
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
        }
    };

    const updateExam = async () => {
        try {
            isLoading = true;
            const res = await fetch(
                `http://localhost:10000/examiners/exams/${examId}`,
                {
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
                }
            );
            if (res.ok) await fetchData();
            else
                fireError(`Failed to update exam: ${(await res.json()).error}`);
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
        }
    };

    onMount(fetchData);
</script>

<div class="h-full flex flex-col items-center justify-center">
    {#if isLoading}
        <div class="flex flex-col items-center justify-center">
            <Loader stroke="#fff" />
        </div>
    {:else}
        <div
            class="mx-4 flex flex-col rounded-xl md:py-5 py-3 md:px-20 px-10 shadow-2xl bg-white"
        >
            <div class="flex flex-row-reverse">
                <button class="text-red-500 ml-5" on:click={deleteExam}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-7 w-7"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
                {#if !exam.Live}
                    <button
                        on:click={() => {
                            editMode = !editMode;
                        }}
                        class="text-purple"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-7 w-7"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                            />
                            <path
                                fill-rule="evenodd"
                                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </button>
                {/if}
            </div>
            <label for="title" class="text-purple text-lg">Title</label>
            <input
                type="text"
                value={exam.Title}
                on:input={(t) => (title = t.target.value)}
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                id="title"
                readonly={!editMode}
            />
            <label for="id" class="text-purple text-lg">ID</label>
            <div
                id="id"
                class="text-black rounded-lg text-xl border-transparent"
            >
                {exam.ID}
            </div>
            <label for="date" class="text-purple text-lg">Date</label>
            <input
                type="datetime-local"
                value={exam.Date}
                on:input={(d) => (date = d.target.value)}
                id="date"
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                readonly={!editMode}
            />
            <label for="duration" class="text-purple text-lg">Duration</label>
            <input
                type="number"
                value={exam.Duration}
                on:input={(d) => (duration = Number(d.target.value))}
                id="duration"
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                readonly={!editMode}
            />
            <label for="subject" class="text-purple text-lg">Subject</label>
            <input
                type="text"
                value={exam.Subject}
                on:input={(s) => (subject = s.target.value)}
                id="subject"
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                readonly={!editMode}
            />
            <label for="examiner" class="text-purple text-lg">Examiner</label>
            <div
                id="examiner"
                class="text-black rounded-lg text-xl border-transparent"
            >
                {exam.Examiner}
            </div>
            <label for="live" class="inline-flex items-center mt-3"
                ><input
                    type="checkbox"
                    id="live"
                    class="form-checkbox h-5 w-5 text-purple-600 rounded-md"
                    checked={exam.Live}
                    disabled
                /><span class="ml-2 text-purple text-lg">Live</span></label
            >
            <button
                on:click={exam.Live ? cancelExam : scheduleExam}
                class="bg-transparent mt-5 rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            >
                {exam.Live ? "Cancel Exam" : "Schedule Exam"}
            </button>
            {#if editMode}
                <button
                    on:click={updateExam}
                    class="bg-transparent rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    >Submit</button
                >
            {:else}
                <Link
                    to={`/exams/${examId}/answer-sheets`}
                    class="text-center bg-transparent rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                >
                    Answer Sheets
                </Link>
                <Link
                    to={`/exams/${examId}/results`}
                    class="text-center bg-transparent rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                >
                    Results
                </Link>
            {/if}
        </div>
    {/if}
</div>
