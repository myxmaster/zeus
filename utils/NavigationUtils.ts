import { StackNavigationProp } from '@react-navigation/stack';

import stores from '../stores/Stores';

const protectedNavigation = async (
    navigation: StackNavigationProp<any, any>,
    route: string,
    disactivatePOS?: boolean,
    routeParams?: any
) => {
    const { posStatus, settings, setPosStatus, setPendingNavigation } =
        stores.settingsStore;
    const loginRequired = settings && (settings.passphrase || settings.pin);
    const posEnabled = posStatus === 'active';

    if (posEnabled && loginRequired) {
        setPendingNavigation({ route, params: routeParams });
        stores.settingsStore.setLoginStatus(false);
    } else {
        if (disactivatePOS) setPosStatus('inactive');
        navigation.navigate(route, routeParams);
    }
};

export { protectedNavigation };
