<template>
	<div class="seventv-settings-node" tabindex="0" :disabled="node.disabledIf?.()" :grid-mode="node.custom?.gridMode">
		<!--
		<div class="seventv-settings-node-wrapper">
			<div class="seventv-settings-node-items">
				<div class="seventv-settings-node-label">
					<span class="seventv-settings-node-label-text">
						{{ node.label }}
					</span>
					<div class="seventv-settings-node-label-hint" :tooltip="node.hint">ⓘ</div>
				</div>
				<div class="seventv-settings-node-component-container">
					<component :is="getComponent(node)" :node="node" />
				</div>
			</div>
		</div>
		-->
		<div class="label">
			<div class="title">
				{{ node.label }}
			</div>
			<div v-if="node.hint" class="subtitle">
				{{ node.hint }}
			</div>
		</div>
		<div v-if="node.custom && node.custom.gridMode === 'new-row'" class="content">
			<component :is="node.custom.component" />
		</div>
		<div v-else class="control">
			<component :is="getComponent(node)" :node="node" />
		</div>
	</div>
</template>

<script setup lang="ts">
import FormCheckbox from "@/site/global/settings/control/FormCheckbox.vue";
import FormDropdown from "@/site/global/settings/control/FormDropdown.vue";
import FormInput from "@/site/global/settings/control/FormInput.vue";
import FormSelect from "@/site/global/settings/control/FormSelect.vue";
import FormSlider from "@/site/global/settings/control/FormSlider.vue";
import FormToggle from "@/site/global/settings/control/FormToggle.vue";

defineProps<{
	node: SevenTV.SettingNode<SevenTV.SettingType>;
}>();

const standard = {
	SELECT: FormSelect,
	DROPDOWN: FormDropdown,
	CHECKBOX: FormCheckbox,
	INPUT: FormInput,
	TOGGLE: FormToggle,
	SLIDER: FormSlider,
	CUSTOM: undefined,
	NONE: undefined,
};

function getComponent(node: SevenTV.SettingNode<SevenTV.SettingType>) {
	return standard[node.type] ?? node.custom?.component;
}
</script>

<style scoped lang="scss">
.seventv-settings-node {
	display: grid;
	grid-template-columns: 1fr auto;
	grid-template-rows: 1fr auto;
	grid-auto-flow: row;
	grid-template-areas:
		"label control"
		"content content";
	row-gap: 1rem;
	padding: 0.25rem 0;
	border-radius: 0.5rem;

	transition: background-color 90ms ease-out;
	&:hover {
		background-color: rgba(0, 0, 0, 25%);
	}

	&[disabled="true"] {
		opacity: 0.35;
		pointer-events: none;
	}

	.label {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr auto;
		grid-template-areas:
			"title"
			"subtitle";
		grid-area: label;
		margin: 0 1rem;
		gap: 0.5rem;
	}

	.title {
		grid-area: title;
		font-size: 1.35rem;
		font-weight: 800;
		flex-shrink: 0;
	}

	.subtitle {
		grid-area: subtitle;
		color: hsla(0deg, 0%, 60%, 50%);
		padding: 0.5rem;
		margin: -0.5rem;
		width: 100%;
	}

	.content {
		display: grid;
		grid-auto-columns: 1fr;
		grid-area: content;
		margin: 0 1rem;
	}

	.control {
		display: grid;
		justify-self: end;
		align-items: start;
		margin: 0.5rem 1rem;
		grid-area: control;
	}

	@media (max-width: 60rem) {
		.subtitle,
		.control,
		.content {
			display: none;
		}

		&:focus-within {
			grid-template-rows: 1fr 1fr 1fr;
			grid-template-rows: 1fr;
			.subtitle,
			.control,
			.content {
				display: grid;
			}
		}
	}
}
</style>
