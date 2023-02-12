const config = {
    chainName: 'moonriver',
    prefix: '',
    dataSource: {
        archive: 'https://moonriver.archive.subsquid.io/graphql',
        chain: 'wss://moonriver.api.onfinality.io/ws?apikey=e1976c19-7166-4427-86e3-ca05dab43ff2',
    },
    typesBundle: 'moonriver',
    batchSize: 100,
}

export default config
