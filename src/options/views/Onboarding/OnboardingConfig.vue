<template>
	<main class="onboarding-config">
		<div class="header">
			<h1>Customize Your Experience</h1>
			<p>
				We'll ask you a few questions and recommend you some settings to get you started. You can change these
				later at any time.
			</p>
		</div>

		<div class="settings">
			<div v-if="!acknowledgements.has('new-chat')" class="new-chat-advisory">
				<strong>7TV introduces a completely new, high-performance chat experience.</strong>
				<span class="emphasize-bad-compat">
					This may prevent modifications by other extensions from working.
				</span>
				<span>
					We are working on improving compatibility.
					<a href="https://discord.gg/7tv" target="_blank">Let us know what we're missing</a>.
				</span>

				<span></span>

				<UiButton class="ui-button-important" @click="[acknowledgements.add('new-chat'), setLock(false)]">
					<template #icon>
						<GearsIcon />
					</template>
					<span>CONFIGURE</span>
				</UiButton>
			</div>

			<Transition v-else name="question" appear>
				<div v-if="currentQuestion" class="questions">
					<div class="question">
						<h2>{{ currentQuestion.title }}</h2>

						<div v-if="currentQuestion.kind === 'either'" class="options">
							<UiButton @click="onAnswer(currentQuestion!, true)">
								<span>Yes</span>
							</UiButton>
							<UiButton @click="onAnswer(currentQuestion!, false)">
								<span>No</span>
							</UiButton>
						</div>

						<div
							v-else-if="currentQuestion.kind === 'config' && currentQuestion.configEffect"
							class="config"
						>
							<UiScrollable>
								<SettingsNode
									v-for="node of currentQuestion.configEffect.map((k) => nodes.get(k)!)"
									:key="node.key"
									:node="node"
								/>
							</UiScrollable>

							<UiButton @click="onAnswer(currentQuestion!, true)">
								<span>Confirm</span>
							</UiButton>
						</div>
					</div>
				</div>
			</Transition>
		</div>
	</main>
</template>

<script setup lang="ts">
const emit = defineEmits<{
	(e: "completed"): void;
}>();

const { setCompleted, setLock } = useOnboarding("config");

const settings = useSettings();

const nodes = reactive<Map<string, SevenTV.SettingNode>>(new Map());
const acknowledgements = reactive(new Set<string>([]));

const questions = ref<Question[]>([
	{
		id: "active-chatter",
		kind: "either",
		title: "Are you active in chat?",
		immediateConfigEffect: [
			["highlights.basic.mention_sound", true],
			["highlights.basic.mention_title_flash", true],
		],
	},
	{
		id: "chatter-config-autocompletion",
		kind: "config",
		configEffect: [
			"chat_input.autocomplete.colon",
			"chat_input.autocomplete.colon.emoji",
			"chat_input.autocomplete.carousel",
			"chat_input.autocomplete.carousel_arrow_keys",
			"chat_input.autocomplete.chatters",
		],
		title: "Configure Auto-Completion",
		if: ["active-chatter"],
	},
	{
		id: "chatter-config-look",
		kind: "config",
		configEffect: [
			"chat.message_batch_duration",
			"chat.smooth_scroll_duration",
			"chat.line_limit",
			"chat.alternating_background",
			"chat.padding",
			"chat.colored_mentions",
		],
		title: "Configure how the chat looks",
		if: ["active-chatter"],
	},
	{
		id: "chatter-config-ping",
		kind: "config",
		configEffect: ["highlights.basic.mention_title_flash", "highlights.basic.mention_sound"],
		title: "How do you want to be notified when you are mentioned?",
		if: ["active-chatter"],
	},
	{
		id: "chatter-config-spam",
		kind: "config",
		configEffect: [
			"general.autoclaim.channel_points",
			"chat_input.spam.bypass_duplicate",
			"chat_input.spam.rapid_fire_send",
		],
		title: "You might find these options useful as an active chatter",
		if: ["active-chatter"],
	},
	{
		id: "moderator",
		kind: "either",
		title: "Do you moderate communities?",
	},
	{
		id: "moderator-config",
		kind: "config",
		title: "These settings may be relevant to you as a moderator",
		if: ["moderator"],
		configEffect: ["chat.mod_slider"],
	},
	{
		id: "streamer",
		kind: "either",
		title: "Are you a streamer?",
		immediateConfigEffect: [
			// turn off ping effects if user is a streamer
			["general.blur_unlisted_emotes", true],
			["chat.message_batch_duration", 350],
			["highlights.basic.mention_title_flash", false],
			["highlights.basic.mention_sound", false],
		],
	},
	{
		id: "streamer-config",
		kind: "config",
		title: "These settings may be relevant to you as a streamer",
		if: ["streamer"],
		configEffect: [
			"general.blur_unlisted_emotes",
			"chat.message_batch_duration",
			"chat.smooth_scroll_duration",
			"highlights.basic.mention_title_flash",
			"highlights.basic.mention_sound",
		],
	},
]);
const currentQuestion = ref<Question | null>(questions.value[0]);

function onAnswer(q: Question, v: boolean): void {
	if (q) {
		q.answer = v;
	}

	currentQuestion.value = null;

	if (v && q.immediateConfigEffect?.length) {
		for (const [k, val] of q.immediateConfigEffect) {
			const cfg = useConfig(k);
			if (!cfg) continue;

			cfg.value = val;
		}
	}

	useTimeoutFn(() => {
		let n: Question | undefined;
		let i = -1;

		for (;;) {
			i++;

			n = questions.value[questions.value.indexOf(q) + (i + 1)];
			if (!n) break;

			let shouldContinue = false;
			for (const i of n.if ?? []) {
				const q = questions.value.find((q) => q.id === i);
				if (!q) continue;

				if (q.answer === false) shouldContinue = true;
			}

			if (shouldContinue) continue;
			break;
		}

		if (!n) {
			emit("completed");
			setLock(false);
			setCompleted(true);
		}

		currentQuestion.value = n;
	}, 500);
}

const allModules = import.meta.glob("@/site/**/modules/**/*Module.vue", {
	eager: false,
	import: "config",
});
for (const loader of Object.values(allModules)) {
	(loader as () => Promise<SevenTV.SettingNode[]>)().then((a) => {
		if (!Array.isArray(a)) return;

		settings.register(a);
		for (const n of a) {
			nodes.set(n.key, n);
		}
	});
}

interface Question {
	id: string;
	title: string;
	kind: "either" | "config";
	if?: string[];
	configEffect?: string[];
	immediateConfigEffect?: [string, SevenTV.SettingType][];
	answer?: boolean | string | number;
}
</script>

<script lang="ts">
import { reactive, ref } from "vue";
import { useTimeoutFn } from "@vueuse/shared";
import { useConfig, useSettings } from "@/composable/useSettings";
import SettingsNode from "@/site/global/settings/SettingsNode.vue";
import GearsIcon from "@/assets/svg/icons/GearsIcon.vue";
import { OnboardingStepRoute, useOnboarding } from "./Onboarding";
import UiButton from "@/ui/UiButton.vue";
import UiScrollable from "@/ui/UiScrollable.vue";

export const step: OnboardingStepRoute = {
	name: "config",
	order: 2,
};
</script>

<style scoped lang="scss">
// q animation
.question-enter-active,
.question-leave-active {
	transition: transform 270ms cubic-bezier(0.48, 1.29, 0, -1.57), opacity 300ms;
}
.question-enter-from,
.question-leave-to {
	transform: translateY(1rem);
	opacity: 0.5;
}

main {
	display: grid;
	width: 100%;
	grid-template-rows: max-content 1fr;
	grid-template-areas:
		"header"
		"settings";

	.header {
		grid-area: header;
		justify-self: center;
		align-self: center;
		text-align: center;
		max-width: 60vw;
		border-bottom: 0.25rem solid var(--seventv-muted);

		h1 {
			font-size: max(1rem, 3vw);
		}
		p {
			font-size: max(1rem, 1vw);
		}
	}

	.settings {
		grid-area: settings;
		justify-self: center;
		align-self: center;
		display: grid;
		margin-bottom: 15%;
		padding: 1rem;
		border-radius: 0.25em;

		.new-chat-advisory {
			margin: 0 5%;
			padding: 5vw 0;
			text-align: center;
			font-size: max(1rem, 2vw);
			display: grid;
			justify-items: center;
			gap: 1em;

			button {
				font-size: 2vw;
				padding: 0 2vw;
				width: max-content;
			}

			a {
				cursor: pointer;
				color: var(--seventv-accent);
				&:hover {
					text-decoration: underline;
				}
			}

			.emphasize-bad-compat {
				font-style: italic;
			}
		}

		.questions {
			text-align: center;
			font-size: max(1rem, 2vw);
			display: grid;
			gap: 1em;

			align-items: center;

			.question {
				display: grid;
				gap: 0.25em;

				h2 {
					font-size: max(1rem, 1.25vw);
				}

				border-radius: 0.25rem;

				.options {
					display: flex;
					justify-content: flex-end;
					align-self: center;
					align-content: center;
					gap: 1em;
					grid-template-columns: repeat(2, 1fr);

					button {
						max-width: 6vw;
						&:hover {
							outline-width: 0.15rem;
						}
					}

					:nth-child(1) {
						outline-color: rgba(128, 255, 128, 25%);
					}
					:nth-child(2) {
						outline-color: rgba(255, 128, 128, 25%);
					}
				}

				.config {
					background-color: var(--seventv-background-shade-2);
					border-radius: 0.25rem;
					outline: 0.1rem solid var(--seventv-input-border);
					display: grid;
					gap: 1em;
					font-size: 1rem;
					text-align: start;
					max-height: 50vh;
					margin: 0 15vw;
					button {
						font-size: 2vw;
					}
				}
			}

			.progress {
				font-size: 1vw;
				color: var(--seventv-muted);
			}
		}
	}
}
</style>
