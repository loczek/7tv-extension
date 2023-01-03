import Select from "./Select.vue";
import Dropdown from "./Dropdown.vue";
import Checkbox from "./Checkbox.vue";
import Input from "./Input.vue";
import Toggle from "./Toggle.vue";

const standard = {
	SELECT: Select,
	DROPDOWN: Dropdown,
	CHECKBOX: Checkbox,
	INPUT: Input,
	TOGGLE: Toggle,
	CUSTOM: undefined,
};

export function getComponent(node: SevenTV.SettingNode<SevenTV.SettingType>) {
	return standard[node.type] ?? node.component;
}
