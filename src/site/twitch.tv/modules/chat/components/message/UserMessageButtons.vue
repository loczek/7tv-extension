<template>
	<div class="seventv-chat-message-buttons">
		<div
			v-if="msg.pinnable && !msg.moderation.deleted"
			ref="pinButtonRef"
			class="seventv-button"
			@click="pinPrompt = true"
		>
			<PinIcon />
		</div>
		<div class="seventv-button" @click="openReplyTray">
			<component :is="msg.parent ? TwChatReply : ReplyIcon" />
		</div>
	</div>

	<!-- Prompt for Pin -->
	<template v-if="pinPrompt && pinPromptContainer">
		<Teleport :to="pinPromptContainer">
			<UiConfirmPrompt
				title="Pin Message?"
				:choices="['yes', 'no']"
				@close="pinPrompt = false"
				@answer="onPinAnswer($event)"
			>
				Are you sure you want to pin this message by
				<UserTag v-if="msg.author" :user="msg.author" />?
			</UiConfirmPrompt>
		</Teleport>
	</template>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ChatMessage } from "@/common/chat/ChatMessage";
import { useTray } from "@/composable/tray/useTray";
import { useFloatScreen } from "@/composable/useFloatContext";
import PinIcon from "@/assets/svg/icons/PinIcon.vue";
import ReplyIcon from "@/assets/svg/icons/ReplyIcon.vue";
import TwChatReply from "@/assets/svg/twitch/TwChatReply.vue";
import UserTag from "./UserTag.vue";
import UiConfirmPrompt from "@/ui/UiConfirmPrompt.vue";
import { shift } from "@floating-ui/dom";

const props = defineProps<{
	msg: ChatMessage;
}>();

const emit = defineEmits<{
	(e: "pin"): void;
}>();

const { set } = useTray("Reply", { msg: props.msg });
const pinPrompt = ref(false);
const pinButtonRef = ref<HTMLElement>();
const pinPromptContainer = useFloatScreen(pinButtonRef, {
	enabled: () => pinPrompt.value,
	middleware: [shift({ padding: 8 })],
});

function openReplyTray(): void {
	set();
}

function onPinAnswer(answer: string): void {
	if (answer !== "yes") return;

	emit("pin");
}
</script>

<style scoped lang="scss">
.seventv-chat-message-buttons {
	z-index: 10;
	display: flex;
	visibility: hidden;
	gap: 0.5rem;
	position: absolute;
	right: 1rem;
	top: -1rem;
	justify-content: center;
	vertical-align: middle;
	cursor: pointer;

	.seventv-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.25rem;
		background-color: var(--color-background-body);
		font-size: 1.25rem;
		fill: currentColor;
		user-select: none;
		z-index: 1;

		&:hover {
			outline: 0.1rem solid var(--seventv-muted);
		}
	}
}
</style>
