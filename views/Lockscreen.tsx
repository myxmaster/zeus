import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import Pin from '../components/Pin';
import Screen from '../components/Screen';
import { ErrorMessage } from '../components/SuccessErrorMessage';
import TextInput from '../components/TextInput';
import ShowHideToggle from '../components/ShowHideToggle';

import SettingsStore from '../stores/SettingsStore';

import { verifyBiometry } from '../utils/BiometricUtils';
import { localeString } from '../utils/LocaleUtils';
import { themeColor } from '../utils/ThemeUtils';

interface LockscreenProps {
    SettingsStore: SettingsStore;
    onAuthenticated?: () => void;
}

interface LockscreenState {
    passphrase: string;
    passphraseAttempt: string;
    duressPassphrase: string;
    pin: string;
    pinAttempt: string;
    duressPin: string;
    hidden: boolean;
    error: boolean;
    authenticationAttempts: number;
}

const maxAuthenticationAttempts = 5;

@inject('SettingsStore')
@observer
export default class Lockscreen extends React.Component<
    LockscreenProps,
    LockscreenState
> {
    constructor(props: any) {
        super(props);
        this.state = {
            passphraseAttempt: '',
            passphrase: '',
            duressPassphrase: '',
            pin: '',
            pinAttempt: '',
            duressPin: '',
            hidden: true,
            error: false,
            authenticationAttempts: 0
        };
    }

    async UNSAFE_componentWillMount() {
        const { SettingsStore, onAuthenticated } = this.props;
        const { settings } = SettingsStore;

        if (settings && settings.passphrase) {
            this.setState({
                passphrase: settings.passphrase,
                duressPassphrase: settings.duressPassphrase || ''
            });
        } else if (settings && settings.pin) {
            this.setState({
                pin: settings.pin,
                duressPin: settings.duressPin || ''
            });
        }

        const isBiometryConfigured = SettingsStore.isBiometryConfigured();

        if (isBiometryConfigured) {
            const isVerified = await verifyBiometry(
                localeString('views.Lockscreen.Biometrics.prompt').replace(
                    'Zeus',
                    'ZEUS'
                )
            );

            if (isVerified) {
                this.resetAuthenticationAttempts();
                SettingsStore.setLoginStatus(true);
                onAuthenticated?.();
                return;
            }
        }

        if (settings.authenticationAttempts) {
            this.setState({
                authenticationAttempts: settings.authenticationAttempts
            });
        }
    }

    onInputLabelPressed = () => {
        this.setState({ hidden: !this.state.hidden });
    };

    onAttemptLogIn = async () => {
        const { SettingsStore, onAuthenticated } = this.props;
        const {
            passphrase,
            duressPassphrase,
            passphraseAttempt,
            pin,
            pinAttempt,
            duressPin
        } = this.state;

        this.setState({ error: false });

        if (
            (passphraseAttempt && passphraseAttempt === passphrase) ||
            (pinAttempt && pinAttempt === pin)
        ) {
            SettingsStore.setLoginStatus(true);
            this.resetAuthenticationAttempts();
            onAuthenticated?.();
        } else if (
            (duressPassphrase && passphraseAttempt === duressPassphrase) ||
            (duressPin && pinAttempt === duressPin)
        ) {
            SettingsStore.setLoginStatus(true);
            this.deleteNodes();
        } else {
            await this.handleFailedAuthentication();
        }
    };

    handleFailedAuthentication = async () => {
        const { SettingsStore } = this.props;
        const { getSettings, updateSettings } = SettingsStore;

        const updatedSettings = await getSettings();
        let authenticationAttempts = 1;
        if (updatedSettings?.authenticationAttempts) {
            authenticationAttempts = updatedSettings.authenticationAttempts + 1;
        }

        this.setState({ authenticationAttempts });

        if (authenticationAttempts >= maxAuthenticationAttempts) {
            this.deleteNodes();
        } else {
            await updateSettings({ authenticationAttempts });
            this.setState({
                error: true,
                pinAttempt: ''
            });
        }
    };

    onSubmitPin = (value: string) => {
        this.setState({ pinAttempt: value }, () => {
            this.onAttemptLogIn();
        });
    };

    deleteNodes = () => {
        const { SettingsStore } = this.props;
        const { updateSettings } = SettingsStore;

        updateSettings({
            nodes: undefined,
            selectedNode: undefined,
            authenticationAttempts: 0
        });
    };

    resetAuthenticationAttempts = () => {
        const { SettingsStore } = this.props;
        const { updateSettings } = SettingsStore;

        updateSettings({ authenticationAttempts: 0 });
    };

    generateErrorMessage = (): string => {
        const { passphrase, authenticationAttempts } = this.state;
        let incorrect = '';

        if (passphrase) {
            incorrect = localeString('views.Lockscreen.incorrectPassword');
        } else {
            incorrect = localeString('views.Lockscreen.incorrectPin');
        }

        return (
            incorrect +
            '\n' +
            (maxAuthenticationAttempts - authenticationAttempts).toString() +
            ' ' +
            localeString('views.Lockscreen.authenticationAttempts')
        );
    };

    render() {
        const { SettingsStore } = this.props;
        const { settings } = SettingsStore;
        const { passphrase, passphraseAttempt, pin, hidden, error } =
            this.state;

        return (
            <Screen>
                {!!passphrase && (
                    <View
                        style={{
                            ...styles.content,
                            flex: 1,
                            justifyContent: 'center',
                            marginTop:
                                Platform.OS === 'android' &&
                                SettingsStore.loginRequired()
                                    ? 30
                                    : 0
                        }}
                    >
                        {error && (
                            <ErrorMessage
                                message={this.generateErrorMessage()}
                            />
                        )}
                        <View style={{ marginBottom: 40 }}>
                            <Text
                                style={{
                                    ...styles.mainText,
                                    color: themeColor('text')
                                }}
                            >
                                {localeString('views.Lockscreen.enterPassword')}
                            </Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder={'****************'}
                                placeholderTextColor="darkgray"
                                value={passphraseAttempt}
                                onChangeText={(text: string) =>
                                    this.setState({
                                        passphraseAttempt: text,
                                        error: false
                                    })
                                }
                                autoCapitalize="none"
                                autoCorrect={false}
                                secureTextEntry={hidden}
                                autoFocus={true}
                                style={{
                                    ...styles.textInput,
                                    paddingTop: passphraseAttempt === '' ? 6 : 2
                                }}
                            />
                            <View style={styles.showHideToggle}>
                                <ShowHideToggle
                                    onPress={() => this.onInputLabelPressed()}
                                />
                            </View>
                        </View>
                        <View style={styles.button}>
                            <Button
                                title={localeString('views.Lockscreen.login')}
                                onPress={() => this.onAttemptLogIn()}
                                containerStyle={{ width: 300 }}
                                adaptiveWidth
                            />
                        </View>
                    </View>
                )}
                {!!pin && (
                    <View style={styles.container}>
                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    flex: 2,
                                    marginTop: 25,
                                    marginBottom: 25
                                }}
                            >
                                {error && (
                                    <ErrorMessage
                                        message={this.generateErrorMessage()}
                                    />
                                )}
                            </View>
                            <Text
                                style={{
                                    ...styles.mainText,
                                    color: themeColor('text'),
                                    flex: 1,
                                    justifyContent: 'flex-end'
                                }}
                            >
                                {localeString('views.Lockscreen.pin')}
                            </Text>
                            <View
                                style={{
                                    flex: 8,
                                    justifyContent: 'flex-end'
                                }}
                            >
                                <Pin
                                    onSubmit={this.onSubmitPin}
                                    onPinChange={() =>
                                        this.setState({ error: false })
                                    }
                                    hidePinLength={true}
                                    pinLength={pin.length}
                                    shuffle={settings.scramblePin}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center'
    },
    container: {
        flex: 1
    },
    button: {
        paddingTop: 15,
        paddingBottom: 15
    },
    inputContainer: {
        flexDirection: 'row'
    },
    textInput: {
        flex: 1
    },
    showHideToggle: {
        alignSelf: 'center',
        marginLeft: 10
    },
    mainText: {
        fontFamily: 'PPNeueMontreal-Book',
        fontSize: 20,
        textAlign: 'center'
    }
});
