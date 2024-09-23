jest.mock('./AddressUtils', () => ({
    processSendAddress: () => mockProcessSendAddress,
    isValidBitcoinAddress: () => mockIsValidBitcoinAddress,
    isValidLightningPubKey: () => mockIsValidLightningPubKey,
    isValidLightningPaymentRequest: () => mockIsValidLightningPaymentRequest,
    isValidLightningOffer: () => mockIsValidLightningOffer,
    isValidLNDHubAddress: () => mockIsValidLNDHubAddress,
    isValidNpub: () => mockIsValidNpub,
    isPsbt: () => mockIsValidPsbt,
    isValidTxHex: () => mockIsValidTxHex,
    isKeystoreWalletExport: () => mockIsKeystoreWalletExport,
    isJsonWalletExport: () => mockIsJsonWalletExport,
    isStringWalletExport: () => mockIsStringWalletExport,
    isWpkhDescriptor: () => mockIsWpkhDescriptor,
    isNestedWpkhDescriptor: () => mockIsNestedWpkhDescriptor,
    isValidXpub: () => mockIsValidXpub
}));
jest.mock('./TorUtils', () => ({}));
jest.mock('./BackendUtils', () => ({
    supportsOnchainSends: () => mockSupportsOnchainSends
}));
jest.mock('../stores/Stores', () => ({
    nodeInfoStore: { nodeInfo: {} },
    invoicesStore: { getPayReq: jest.fn() }
}));
jest.mock('react-native-blob-util', () => ({}));
jest.mock('react-native-encrypted-storage', () => ({}));
jest.mock('react-native-fs', () => ({}));
jest.mock('js-lnurl', () => ({
    getParams: () => mockGetLnurlParams,
    findlnurl: () => mockFindLnurl
}));
import stores from '../stores/Stores';
import handleAnything from './handleAnything';
let mockProcessSendAddress = {};
let mockIsValidBitcoinAddress = false;
let mockIsValidLightningPubKey = false;
let mockIsValidLightningPaymentRequest = false;
let mockIsValidLightningOffer = false;
let mockIsValidLNDHubAddress = false;
let mockIsValidNpub = false;
let mockIsValidPsbt = false;
let mockIsValidTxHex = false;
let mockIsKeystoreWalletExport = false;
let mockIsJsonWalletExport = false;
let mockIsStringWalletExport = false;
let mockIsWpkhDescriptor = false;
let mockIsNestedWpkhDescriptor = false;
let mockIsValidXpub = false;
let mockSupportsOnchainSends = true;
let mockGetLnurlParams = {};
let mockFindLnurl: string | null = null;

describe('handleAnything', () => {
    beforeEach(() => {
        mockProcessSendAddress = {};
        mockIsValidBitcoinAddress = false;
        mockIsValidLightningPubKey = false;
        mockIsValidLightningPaymentRequest = false;
        mockIsValidLightningOffer = false;
        mockIsValidLNDHubAddress = false;
        mockIsValidNpub = false;
        mockIsValidPsbt = false;
        mockIsValidTxHex = false;
        mockIsKeystoreWalletExport = false;
        mockIsJsonWalletExport = false;
        mockIsStringWalletExport = false;
        mockIsWpkhDescriptor = false;
        mockIsNestedWpkhDescriptor = false;
        mockIsValidXpub = false;
        mockSupportsOnchainSends = true;
        mockFindLnurl = null;
    });

    describe('bitcoin address', () => {
        it('should return Send screen if not from clipboard', async () => {
            const data = 'test data';
            mockProcessSendAddress = { value: 'some address', amount: 123 };
            mockIsValidBitcoinAddress = true;

            const result = await handleAnything(data);

            expect(result).toEqual([
                'Send',
                {
                    destination: 'some address',
                    amount: 123,
                    transactionType: 'On-chain',
                    isValid: true
                }
            ]);
        });

        it('should return true if from clipboard', async () => {
            const data = 'test data';
            mockProcessSendAddress = { value: 'some address', amount: 123 };
            mockIsValidBitcoinAddress = true;

            const result = await handleAnything(data, undefined, true);

            expect(result).toEqual(true);
        });
    });

    describe('lightning public key', () => {
        it('should return Send screen if not from clipboard', async () => {
            const data = 'test data';
            mockProcessSendAddress = { value: 'some public key' };
            mockIsValidLightningPubKey = true;

            const result = await handleAnything(data);

            expect(result).toEqual([
                'Send',
                {
                    destination: 'some public key',
                    transactionType: 'Keysend',
                    isValid: true
                }
            ]);
        });

        it('should return true if from clipboard', async () => {
            const data = 'test data';
            mockProcessSendAddress = { value: 'some public key' };
            mockIsValidLightningPubKey = true;

            const result = await handleAnything(data, undefined, true);

            expect(result).toEqual(true);
        });
    });

    describe('lightning payment request', () => {
        it('should return PaymentRequest screen and call getPayReq if not from clipboard', async () => {
            const data = 'test data';
            mockProcessSendAddress = { value: 'some payment request' };
            mockIsValidLightningPaymentRequest = true;

            const result = await handleAnything(data);

            expect(result).toEqual(['PaymentRequest', {}]);
            expect(stores.invoicesStore.getPayReq).toHaveBeenCalledWith(
                'some payment request'
            );
        });

        it('should return true if from clipboard', async () => {
            const data = 'test data';
            mockProcessSendAddress = { value: 'some payment request' };
            mockIsValidLightningPaymentRequest = true;

            const result = await handleAnything(data, undefined, true);

            expect(result).toEqual(true);
        });
    });

    describe('bitcoin URI with lnurl and backend not supporting on-chain sends', () => {
        // test needs to be mocked out more as endpoint at https://ts.dergigi.com/BTC/UILNURL/pay/i/Wg7JV2ZFHs4cschM6bG5PT
        // returns {"status":"ERROR","reason":"Invoice not in a valid payable state"} and throws on handleAnything.ts:54
        it('should return LnurlPay screen if not from clipboard', async () => {
            const data =
                'bitcoin:BC1QUXCS7V556UTNUKU93HSZ7LHHFFLWN9NF2UTQ6N?pj=https://ts.dergigi.com/BTC/pj&lightning=LNURL1DP68GURN8GHJ7ARN9EJX2UN8D9NKJTNRDAKJ7SJ5GVH42J2VFE24YNP0WPSHJTMF9ATKWD622CE953JGWV6XXUMRDPXNVCJ8X4G9GF2CHDF';
            mockProcessSendAddress = {
                value: 'BC1QUXCS7V556UTNUKU93HSZ7LHHFFLWN9NF2UTQ6N',
                lightning:
                    'LNURL1DP68GURN8GHJ7ARN9EJX2UN8D9NKJTNRDAKJ7SJ5GVH42J2VFE24YNP0WPSHJTMF9ATKWD622CE953JGWV6XXUMRDPXNVCJ8X4G9GF2CHDF'
            };
            mockIsValidBitcoinAddress = true;
            mockSupportsOnchainSends = false;
            mockGetLnurlParams = {
                tag: 'payRequest',
                domain: 'ts.dergigi.com'
            };

            const result = await handleAnything(data);

            expect(result).toEqual([
                'LnurlPay',
                {
                    lnurlParams: mockGetLnurlParams
                }
            ]);
        });

        it('should return true if from clipboard', async () => {
            const data =
                'bitcoin:BC1QUXCS7V556UTNUKU93HSZ7LHHFFLWN9NF2UTQ6N?pj=https://ts.dergigi.com/BTC/pj&lightning=LNURL1DP68GURN8GHJ7ARN9EJX2UN8D9NKJTNRDAKJ7SJ5GVH42J2VFE24YNP0WPSHJTMF9ATKWD622CE953JGWV6XXUMRDPXNVCJ8X4G9GF2CHDF';
            mockProcessSendAddress = {
                value: 'BC1QUXCS7V556UTNUKU93HSZ7LHHFFLWN9NF2UTQ6N',
                lightning:
                    'LNURL1DP68GURN8GHJ7ARN9EJX2UN8D9NKJTNRDAKJ7SJ5GVH42J2VFE24YNP0WPSHJTMF9ATKWD622CE953JGWV6XXUMRDPXNVCJ8X4G9GF2CHDF'
            };
            mockIsValidBitcoinAddress = true;
            mockSupportsOnchainSends = false;

            const result = await handleAnything(data, undefined, true);

            expect(result).toEqual(true);
        });
    });

    describe('bitcoin URI with bolt11 and backend not supporting on-chain sends', () => {
        it('should return PaymentRequest screen and call getPayReq if not from clipboard', async () => {
            const data =
                'bitcoin:BC1QYLH3U67J673H6Y6ALV70M0PL2YZ53TZHVXGG7U?amount=0.00001&label=sbddesign%3A%20For%20lunch%20Tuesday&message=For%20lunch%20Tuesday&lightning=LNBC10U1P3PJ257PP5YZTKWJCZ5FTL5LAXKAV23ZMZEKAW37ZK6KMV80PK4XAEV5QHTZ7QDPDWD3XGER9WD5KWM36YPRX7U3QD36KUCMGYP282ETNV3SHJCQZPGXQYZ5VQSP5USYC4LK9CHSFP53KVCNVQ456GANH60D89REYKDNGSMTJ6YW3NHVQ9QYYSSQJCEWM5CJWZ4A6RFJX77C490YCED6PEMK0UPKXHY89CMM7SCT66K8GNEANWYKZGDRWRFJE69H9U5U0W57RRCSYSAS7GADWMZXC8C6T0SPJAZUP6';
            mockProcessSendAddress = {
                value: 'BC1QYLH3U67J673H6Y6ALV70M0PL2YZ53TZHVXGG7U',
                lightning:
                    'LNBC10U1P3PJ257PP5YZTKWJCZ5FTL5LAXKAV23ZMZEKAW37ZK6KMV80PK4XAEV5QHTZ7QDPDWD3XGER9WD5KWM36YPRX7U3QD36KUCMGYP282ETNV3SHJCQZPGXQYZ5VQSP5USYC4LK9CHSFP53KVCNVQ456GANH60D89REYKDNGSMTJ6YW3NHVQ9QYYSSQJCEWM5CJWZ4A6RFJX77C490YCED6PEMK0UPKXHY89CMM7SCT66K8GNEANWYKZGDRWRFJE69H9U5U0W57RRCSYSAS7GADWMZXC8C6T0SPJAZUP6'
            };
            mockIsValidBitcoinAddress = true;
            mockSupportsOnchainSends = false;

            const result = await handleAnything(data);

            expect(stores.invoicesStore.getPayReq).toHaveBeenCalledWith(
                'LNBC10U1P3PJ257PP5YZTKWJCZ5FTL5LAXKAV23ZMZEKAW37ZK6KMV80PK4XAEV5QHTZ7QDPDWD3XGER9WD5KWM36YPRX7U3QD36KUCMGYP282ETNV3SHJCQZPGXQYZ5VQSP5USYC4LK9CHSFP53KVCNVQ456GANH60D89REYKDNGSMTJ6YW3NHVQ9QYYSSQJCEWM5CJWZ4A6RFJX77C490YCED6PEMK0UPKXHY89CMM7SCT66K8GNEANWYKZGDRWRFJE69H9U5U0W57RRCSYSAS7GADWMZXC8C6T0SPJAZUP6'
            );
            expect(result).toEqual(['PaymentRequest', {}]);
        });

        it('should return true if from clipboard', async () => {
            const data =
                'bitcoin:BC1QYLH3U67J673H6Y6ALV70M0PL2YZ53TZHVXGG7U?amount=0.00001&label=sbddesign%3A%20For%20lunch%20Tuesday&message=For%20lunch%20Tuesday&lightning=LNBC10U1P3PJ257PP5YZTKWJCZ5FTL5LAXKAV23ZMZEKAW37ZK6KMV80PK4XAEV5QHTZ7QDPDWD3XGER9WD5KWM36YPRX7U3QD36KUCMGYP282ETNV3SHJCQZPGXQYZ5VQSP5USYC4LK9CHSFP53KVCNVQ456GANH60D89REYKDNGSMTJ6YW3NHVQ9QYYSSQJCEWM5CJWZ4A6RFJX77C490YCED6PEMK0UPKXHY89CMM7SCT66K8GNEANWYKZGDRWRFJE69H9U5U0W57RRCSYSAS7GADWMZXC8C6T0SPJAZUP6';
            mockProcessSendAddress = {
                value: 'BC1QYLH3U67J673H6Y6ALV70M0PL2YZ53TZHVXGG7U',
                lightning:
                    'LNBC10U1P3PJ257PP5YZTKWJCZ5FTL5LAXKAV23ZMZEKAW37ZK6KMV80PK4XAEV5QHTZ7QDPDWD3XGER9WD5KWM36YPRX7U3QD36KUCMGYP282ETNV3SHJCQZPGXQYZ5VQSP5USYC4LK9CHSFP53KVCNVQ456GANH60D89REYKDNGSMTJ6YW3NHVQ9QYYSSQJCEWM5CJWZ4A6RFJX77C490YCED6PEMK0UPKXHY89CMM7SCT66K8GNEANWYKZGDRWRFJE69H9U5U0W57RRCSYSAS7GADWMZXC8C6T0SPJAZUP6'
            };
            mockIsValidBitcoinAddress = true;
            mockSupportsOnchainSends = false;

            const result = await handleAnything(data, undefined, true);

            expect(result).toEqual(true);
        });
    });

    describe('xpub key', () => {
        it('should return ImportAccount screen', async () => {
            const xpubKey = 'xpubexample';
            mockProcessSendAddress = { value: xpubKey };
            mockIsValidXpub = true;

            const result = await handleAnything(xpubKey);

            expect(result).toEqual([
                'ImportAccount',
                {
                    extended_public_key: xpubKey
                }
            ]);
        });
    });

    describe('Zeus contact data', () => {
        it('should return ContactDetails screen with nostrContact data', async () => {
            const zeusContactData =
                'zeuscontact:{"contactId":"123","name":"Test Contact","npub":"npub123..."}';
            mockProcessSendAddress = { value: zeusContactData };

            const result = await handleAnything(zeusContactData);

            expect(result).toEqual([
                'ContactDetails',
                {
                    nostrContact: {
                        contactId: '123',
                        name: 'Test Contact',
                        npub: 'npub123...'
                    },
                    isNostrContact: true
                }
            ]);
        });
    });
});
