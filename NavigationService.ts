import { CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

let _navigator: StackNavigationProp<any, any>;

function setTopLevelNavigator(navigatorRef: StackNavigationProp<any, any>) {
    _navigator = navigatorRef;
}

function navigate(routeName: string, params?: any) {
    _navigator.dispatch(
        CommonActions.navigate({
            name: routeName,
            params
        })
    );
}

function getNavigation(): StackNavigationProp<any, any> {
    return _navigator;
}

// add other navigation functions that you need and export them

export default {
    navigate,
    setTopLevelNavigator,
    getNavigation
};
