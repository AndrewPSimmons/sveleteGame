<script lang="ts">
	import { onMount } from 'svelte';
	import { homeFormData } from '../stores';
	import { userData } from '../stores';
	import axios from 'axios';
	import { api_domain } from '../../../globalConsts';
	userData.subscribe((value) => {
		console.log("In the subscribe", value);
	})
	
	export let selection: string;
	export let roomCode: string = "";
	let disableButton = false;
	let errors: {[key:string]: string[]} = {
		'username': [],
		'password': [],
		'gameId': []
	}

	const doJoin = async () => {
		const data = {
			username: $homeFormData.username,
			password: $homeFormData.password,
			roomCode: $homeFormData.roomCode
		};
		const url = `http://${api_domain}/joinRoom?` + new URLSearchParams(data);
		const response = await fetch(url, {
			method: 'GET',
		})
		const resData = await response.json();
		if(response.status === 200){
			console.log("Room joined");
			console.log("Member data", resData.member);
			userData.set({
				username: resData.member.username,
				roomCode: resData.member.roomCode,
				id: resData.member.id,
				isHost: resData.member.isHost
			})
			location.href = "/room"
		}
		else{
			if(resData.message){
				alert(resData.message);
			};
		}
		disableButton = false;
	};

	const doCreate = async () => {
		const data = {
			username: $homeFormData.username,
			password: $homeFormData.password
		};
		const url = `https://${api_domain}/createRoom?`+ new URLSearchParams(data);

		//GET request to create room http method is GET
		const response = await fetch(url, {
			method: 'GET',
		})
		console.log("Normal Repsonse", response);
		const axiosResponse = await axios.get(url);
		console.log("Axios Response", axiosResponse);

		const resData = await response.json();
		if(response.status === 200){
			console.log("Room created");
			userData.set({
				username: resData.host.username,
				roomCode: resData.host.roomCode,
				id: resData.host.id,
				isHost: resData.host.isHost
			})

			location.href = "/room"
		}
		else{
			if(resData.message){
				alert(resData.message);
			};
		}
		disableButton = false;
	};
	
	const submitWrapper = () => {
		if(disableButton)return
		disableButton = true;
		
		//Validate data here
		if($homeFormData.username.length === 0) {
			errors = {...errors, username: ['Username is required']};
		}
		if (selection === 'create') {
			doCreate();
		} else if (selection === 'join') {
			doJoin();
		}
	};

	const updateHomeFormData = (key: string, e: any) => {
		if (!e) return;
		homeFormData.update((data: any) => {
			data[key] = e.target.value;
			return data;
		});
	};
	if(roomCode.length > 0){
		homeFormData.update((data: any) => {
			data['roomCode'] = roomCode;
			return data;
		});
	}
</script>

<div class="bg-gradient-to-br from-blue3 to-blue1 h-full p-4 flex flex-col justify-between px-[10%]">
	<div
		class="flex flex-col items-center justify-start space-y-2"
	>
		<input
			bind:value={$homeFormData.username}
			type="text"
			placeholder="Username"
			on:keyup={(e) => updateHomeFormData('username', e)}
		/>

		<div class="flex flex-col items-center justify-center w-full text-white">
			<input
				bind:value={$homeFormData.password}
				type="text"
				placeholder="Password"
				on:keyup={(e) => updateHomeFormData('password', e)}
			/>
			{#if selection !== 'join'}
				<p class="text-xs opacity-75 ">(leave blank for no password)</p>
			{/if}
		</div>

		{#if selection === 'join'}
			<input
				bind:value={$homeFormData.roomCode}
				type="text"
				placeholder="Room Code"
				on:keyup={(e) => updateHomeFormData('roomCode', e)}
			/>
		{/if}
	</div>

	<div class="ERROR text-black ">
		{#each Object.entries(errors) as [key, error]}
			<p>{error}</p>
		{/each}
	</div>
	<div class="flex flex-col items-center">
		<button disabled={disableButton} on:click={submitWrapper}>{selection === "join" ? "Join": "Create"}</button>
	</div>
</div>

<style>
	input::placeholder {
		@apply text-white opacity-75 text-base;
	}
	input {
		@apply text-2xl px-2 py-2 w-full outline-none bg-blue1 text-white;
	}

	button {
		@apply text-2xl px-2 py-2 w-full bg-gradient-to-bl from-pink2 to-pink-500 text-white rounded-md  ;
	}

	button:disabled{
		@apply opacity-50;
	}
	
</style>
