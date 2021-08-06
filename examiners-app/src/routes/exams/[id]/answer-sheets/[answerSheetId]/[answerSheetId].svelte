<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { md, pki } from "node-forge";
    import { answerSheetStore } from "../../../../../stores/answerSheet";
    import Loader from "../../../../../Loader.svelte";
    import {
        usernameStore,
        identityStore,
    } from "../../../../../stores/identity";
    import Swal from "sweetalert2";

    let isLoading: boolean = false;
    let decrypted: boolean = true;
    const identityString: string = get(identityStore);
    const username: string = get(usernameStore);
    let url: string;
    const { privateKey } = JSON.parse(JSON.parse(identityString).identity);
    const answerSheet: AnswerSheet = get(answerSheetStore);
    // const answerSheet: AnswerSheet = {
    //     ID: "1",
    //     ExamID: "abc",
    //     RollNumber: "2019BCS-023",
    //     Key: "key",
    //     Address: "address",
    // };

    onMount(async () => {
        isLoading = true;
        try {
            const infuraRes = await fetch(
                "https://ipfs.infura.io:5001/api/v0/cat?" +
                    new URLSearchParams({
                        arg: answerSheet.Address,
                    }),
                {
                    method: "POST",
                }
            );
            if (infuraRes.ok) {
                const encryptedBlob = await infuraRes.blob();
                const encryptedBuffer = new Uint8Array(
                    await encryptedBlob.arrayBuffer()
                );
                var iterations = 10000;
                const pKey = pki.privateKeyFromPem(privateKey);
                const password = pKey.decrypt(answerSheet.Key);
                var passwordBytes = new TextEncoder().encode(password);
                var pbkdf2Salt = encryptedBuffer.slice(8, 16);

                var passwordKey = await crypto.subtle.importKey(
                    "raw",
                    passwordBytes,
                    { name: "PBKDF2" },
                    false,
                    ["deriveBits"]
                );

                let pbkdf2Bytes = await crypto.subtle.deriveBits(
                    {
                        name: "PBKDF2",
                        salt: pbkdf2Salt,
                        iterations,
                        hash: "SHA-256",
                    },
                    passwordKey,
                    384
                );

                pbkdf2Bytes = new Uint8Array(pbkdf2Bytes);
                const keyBytes = pbkdf2Bytes.slice(0, 32);
                const ivBytes = pbkdf2Bytes.slice(32);
                const encryptedBytes = encryptedBuffer.slice(16);

                let key = await crypto.subtle.importKey(
                    "raw",
                    keyBytes,
                    { name: "AES-GCM", length: 256 },
                    false,
                    ["decrypt"]
                );

                let decryptedBytes = await crypto.subtle.decrypt(
                    {
                        name: "AES-GCM",
                        iv: ivBytes,
                    },
                    key,
                    encryptedBytes
                );

                decryptedBytes = new Uint8Array(decryptedBytes);
                const blob = new Blob([decryptedBytes], {
                    type: "application/pdf",
                });
                url = URL.createObjectURL(blob);
                decrypted = true;
            }
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
        }
    });

    const fireError = (err) =>
        Swal.fire({
            title: "Error!",
            text: err,
            icon: "error",
            confirmButtonText: "Ok",
        });

    const onSubmit = async () => {
        isLoading = true;
        let paper: File;
        const { value } = await Swal.fire({
            title: "Publish Result",
            input: "file",
            inputLabel: "Upload the result PDF file",
            inputPlaceholder: "Enter password",
            inputAttributes: {
                accept: ".pdf",
            },
        });
        paper = value;
        try {
            if (paper) {
                const examinerPrivateKey = pki.privateKeyFromPem(privateKey);

                const digest = md.sha512.create();
                console.log(paper)
                console.log(paper[0])
                const paperString = await paper.text();
                digest.update(paperString);

                const signature = examinerPrivateKey.sign(digest);

                const body = new FormData();
                body.append(paper.name, paper, paper.name);

                const infuraRes = await fetch(
                    "https://ipfs.infura.io:5001/api/v0/add?quieter=true",
                    {
                        method: "POST",
                        body,
                    }
                );

                const infuraRef = await infuraRes.json();
                const res = await fetch(
                    `http://localhost:10000/examiners/results/${answerSheet.ID}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            address: infuraRef.Hash,
                            signature,
                            username,
                            id: identityString,
                        }),
                    }
                );
                if (res.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Result successfully published",
                    });
                } else
                    fireError(
                        `Could not publish result: ${(await res.json()).error}`
                    );
            } else {
                fireError("You must choose a PDF file");
            }
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
        }
    };
</script>

<div class="h-full flex flex-col items-center">
    {#if isLoading}
        <div class="flex flex-col items-center justify-center">
            <Loader stroke="#fff" />
        </div>
    {:else if decrypted}
        <div class="flex flex-col w-full h-full items-center">
            <button
                on:click={onSubmit}
                class="text-center bg-transparent rounded-full cursor-pointer border border-solid text-white border-white hover:bg-white hover:text-purple font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            >
                Publish Results
            </button>
            <iframe
                src={url + "#toolbar=0&scrollbar=0"}
                type="application/pdf"
                title={answerSheet.RollNumber}
                width="60%"
                height="100%"
                class="rounded-xl my-2"
            />
        </div>
    {/if}
</div>
