<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import Swal from "sweetalert2";
    import Loader from "../../Loader.svelte";
    import { usernameStore, identityStore } from "../../stores/identity";

    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let isLoading: boolean = false;
    let result: Result;
    let url: string;
    let signature: string;

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
            const { examId } = history.state;
            const res = await fetch(
                `http://localhost:10000/students/results/${examId}`,
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
                result = apiRes.result;
                signature = result.Signature;
                const infuraRes = await fetch(
                    "https://ipfs.infura.io:5001/api/v0/cat?" +
                        new URLSearchParams({
                            arg: result.Address,
                        }),
                    {
                        method: "POST",
                    }
                );
                if (infuraRes.ok) {
                    const file = await infuraRes.blob();
                    const blob = new Blob([file], {
                        type: "application/pdf",
                    });
                    url = URL.createObjectURL(blob);
                } else {
                    fireError(
                        "Couldn't load result. Please check your internet connection"
                    );
                }
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

    const toBinary = (string) => {
        const codeUnits = new Uint16Array(string.length);
        for (let i = 0; i < codeUnits.length; i++) {
            codeUnits[i] = string.charCodeAt(i);
        }
        const charCodes = new Uint8Array(codeUnits.buffer);
        let result = "";
        for (let i = 0; i < charCodes.byteLength; i++) {
            result += String.fromCharCode(charCodes[i]);
        }
        return result;
    };

    const onClick = () => {
        Swal.fire({
            icon: "info",
            title: "Signature",
            text: btoa(toBinary(signature)),
        });
    };
</script>

<div class="h-full flex flex-col items-center">
    {#if isLoading}
        <div class="flex flex-col items-center justify-center">
            <Loader stroke="#fff" />
        </div>
    {:else}
        <div class="flex flex-col w-full h-full items-center">
            <button
                on:click={onClick}
                class="text-center bg-transparent rounded-full cursor-pointer border border-solid text-white border-white hover:bg-white hover:text-purple font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            >
                View Signature
            </button>
            <iframe
                src={url + "#toolbar=0&scrollbar=0"}
                type="application/pdf"
                title="Result"
                width="60%"
                height="100%"
                class="rounded-xl my-2"
            />
        </div>
    {/if}
</div>
