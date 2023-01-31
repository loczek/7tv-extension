<template>
	<div class="seventv-slider-container">
		<div class="seventv-slider">
			<div class="values"></div>
			{{ setting }}
			{{ node.options?.unit }}
			<div class="slider-container">
				<input
					:id="node.key"
					v-model="setting"
					type="range"
					:min="node.options?.min"
					:max="node.options?.max"
					:step="node.options?.step"
					class="slider"
				/>
			</div>
		</div>
		<span v-if="thresoldName" class="thresold-name"> ({{ thresoldName }}) </span>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useConfig } from "@/composable/useSettings";

const props = defineProps<{
	node: SevenTV.SettingNode<number, "SLIDER">;
}>();

const setting = useConfig<number>(props.node.key);

const thresoldName = computed(() => {
	if (!props.node.options?.named_thresolds) return;

	const thresolds = props.node.options.named_thresolds;
	let match = 0;
	for (let i = 0; i < thresolds.length; i++) {
		if (setting.value >= thresolds[i][0] && setting.value <= thresolds[i][1]) match = i;
		else continue;
	}

	return thresolds[match][2];
});
</script>
<style scoped lang="scss">
.seventv-slider {
	display: flex;
	align-items: center;
	column-gap: 1rem;
	justify-content: space-between;

	> input {
		cursor: pointer;
	}
}

.thresold-name {
	display: flex;
	align-items: center;
	float: right;
}

.slider-container {
	height: 0.5rem;
	background: var(--seventv-input-background);
	outline: 1px solid var(--seventv-input-border);
	width: fit-content;
	align-items: center;
	border-radius: 10rem;
	display: inline-flex;
}

.slider {
	-webkit-appearance: none;
	appearance: none;
	background: transparent;
}

.slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	background-color: var(--seventv-input-border);
	border-radius: 1rem;
	height: 1.5rem;
	width: 1.5rem;
	z-index: 100;
}

.slider::-webkit-slider-runnable-track {
	-webkit-appearance: none;
	appearance: none;
	cursor: pointer;
}
</style>
