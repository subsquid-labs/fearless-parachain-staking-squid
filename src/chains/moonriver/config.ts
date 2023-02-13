const config = {
    chainName: 'moonriver',
    prefix: '',
    dataSource: {
        archive: 'https://moonriver.archive.subsquid.io/graphql',
        chain: process.env.MOONRIVER_CHAIN_NODE || 'wss://wss.api.moonriver.moonbeam.network',
    },
}

export default config
