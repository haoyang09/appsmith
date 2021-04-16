import {
  MAIN_CONTAINER_WIDGET_ID,
  WidgetTypes,
} from "constants/WidgetConstants";
import { cloneDeep, get, isString } from "lodash";
import { FlattenedWidgetProps } from "reducers/entityReducers/canvasWidgetsReducer";
import { getDynamicBindings } from "utils/DynamicBindingUtils";

/**
 *
 * check if copied widget is being pasted in list widget,
 * if yes, change all keys in template of list widget and
 * update dynamicBindingPathList of ListWidget
 *
 * updates in list widget :
 * 1. `dynamicBindingPathList`
 * 2. `template`
 *
 * @param widget
 * @param widgets
 */
export const handleIfParentIsListWidgetWhilePasting = (
  widget: FlattenedWidgetProps,
  widgets: { [widgetId: string]: FlattenedWidgetProps },
): { [widgetId: string]: FlattenedWidgetProps } => {
  let root = get(widgets, `${widget.parentId}`);

  while (root.parentId && root.widgetId !== MAIN_CONTAINER_WIDGET_ID) {
    if (root.type === WidgetTypes.LIST_WIDGET) {
      const listWidget = root;
      const currentWidget = cloneDeep(widget);
      let template = get(listWidget, "template", {});
      const dynamicBindingPathList: any[] = get(
        listWidget,
        "dynamicBindingPathList",
        [],
      ).slice();

      // iterating over each keys of the new createdWidget checking if value contains currentItem
      const keys = Object.keys(currentWidget);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let value = currentWidget[key];

        if (isString(value) && value.indexOf("currentItem") > -1) {
          const { jsSnippets } = getDynamicBindings(value);

          const modifiedAction = jsSnippets.reduce(
            (prev: string, next: string) => {
              return prev + `${next}`;
            },
            "",
          );

          value = `{{${listWidget.widgetName}.items.map((currentItem) => ${modifiedAction})}}`;

          currentWidget[key] = value;

          dynamicBindingPathList.push({
            key: `template.${currentWidget.widgetName}.${key}`,
          });
        }
      }

      template = {
        ...template,
        [currentWidget.widgetName]: currentWidget,
      };

      // now we have updated `dynamicBindingPathList` and updatedTemplate
      // we need to update it the list widget
      widgets[listWidget.widgetId] = {
        ...listWidget,
        template,
        dynamicBindingPathList,
      };
    }

    root = widgets[root.parentId];
  }

  return widgets;
};
