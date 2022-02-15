const { Harmony } = require('@harmony-js/core');
const {
  ChainID,
  ChainType
} = require('@harmony-js/utils');

const hmy = new Harmony(
    'https://api.s0.b.hmny.io/',
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyTestnet,
    },
);

export default hmy;