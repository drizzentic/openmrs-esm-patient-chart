import React, { FunctionComponent } from "react";
import { Link, useParams, useRouteMatch, useLocation } from "react-router-dom";
import styles from "./chart-review.css";
import { coreWidgets } from "./core-widgets.js";
import { useConfig } from "@openmrs/esm-module-config";
import { string } from "prop-types";

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { widgetPath } = useParams();
  const config = useConfig();

  const defaultPath = `/patient/${patientUuid}/chart`;
  const [widgets, setWidgets] = React.useState([]);

  /*
  const widgetDefinitions = [
    {
      name: "widget",
      label: "Hello", //will be displayed on the nav bar
      esModule: "@jj-widgets", //this module must be in the import map
      path: "/widget" //this will be the path to the widget and will be appended to /patient/:patientUuid/chart
    }
  ] ;
*/

  const [selected, setSelected] = React.useState(getInitialTab());

  React.useEffect(() => {
    const externalWidgets: externalWidgetsType = {};
    const promises = [];
    const moduleMap = {};

    config.widgetDefinitions.forEach(def => {
      externalWidgets[def.name] = def;
      //only import modules once
      if (moduleMap[def.esModule] === undefined) {
        promises.push(System.import(def.esModule));
      }
    });

    Promise.all(promises).then(modules => {
      //widgets is an array of objects, see type below
      const widgets: widgetType[] = [];

      //Promise.all returns an array of resolved modules.
      // Place into an object with key = module name to make it easier to access in the below widget loadinng loop
      modules.map(mod => {
        moduleMap[mod.name] = mod;
      });

      //config.widgets is an array of widget names
      config.widgets.map(widgetName => {
        //First see if name exists in coreWidgets
        if (coreWidgets[widgetName]) {
          widgets.push(coreWidgets[widgetName]);
        } else {
          const widget = externalWidgets[widgetName];
          let Component: FunctionComponent =
            moduleMap[widget.esModule].widgets[widget.name];
          widget.component = () => <Component />;

          widgets.push(widget);
        }
      });

      setWidgets(widgets);
    });
  }, [config, setWidgets]);

  function getInitialTab() {
    if (config == undefined || widgets.length === 0) {
      return 0;
    } else if (widgetPath == undefined) {
      return config.defaultTabIndex;
    } else {
      return widgets.findIndex(element => element.path === "/" + widgetPath);
    }
  }

  const [tabHistory, setTabHistory] = React.useState({});

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["widget"]] = location.search;
      return t;
    });
  }, [match, location]);

  return (
    <>
      <nav className={styles.topnav} style={{ marginTop: "0" }}>
        <ul>
          {widgets &&
            widgets.map((item, index) => {
              return (
                <li key={index}>
                  <div
                    className={`${
                      index === selected ? styles.selected : styles.unselected
                    }`}
                  >
                    <Link
                      to={
                        defaultPath + item.path + (tabHistory[item.path] || "")
                      }
                    >
                      <button
                        className="omrs-unstyled"
                        onClick={() => setSelected(index)}
                      >
                        {item.label}
                      </button>
                    </Link>
                  </div>
                </li>
              );
            })}
        </ul>
      </nav>
      {widgets.length > 0 &&
        selected !== undefined &&
        widgets[selected].component()}
    </>
  );
}

type widgetType = {
  name: string;
  path: string;
  esModule?: string;
  component?: Function;
};

type externalWidgetsType = {
  [key: string]: widgetType;
};
