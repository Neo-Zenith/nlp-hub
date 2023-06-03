export const endpointFixture1 = {
    task: 'lang-change',
    method: 'POST',
    textBased: true,
    options: {
        fav_language: 'string',
        punc_type: 'string',
    },
    endpointPath: '/lang_change',
}

export const endpointFixture2 = {
    task: 'predict',
    method: 'POST',
    textBased: true,
    options: {
        message: 'string',
        removedisfluency: 'boolean',
        normalizeacronym: 'boolean',
    },
    endpointPath: '/backend_predict',
}

export const endpointFixture3 = {
    method: 'GET',
    task: 'fixture3',
    textBased: true,
    options: {
        option1: 'string',
        option2: 'string',
        option3: 'string',
    },
    endpointPath: '/fixture3',
}

export const endpointFixture3dup1 = {
    method: 'GET',
    task: 'fixture3',
    textBased: true,
    options: {
        option1: 'string',
        option2: 'string',
        option3: 'string',
    },
    endpointPath: '/fixture3-1',
}

export const endpointFixture3dup2 = {
    method: 'GET',
    task: 'fixture3-2',
    textBased: true,
    options: {
        option1: 'string',
        option2: 'string',
        option3: 'string',
    },
    endpointPath: '/fixture3',
}

export const serviceFixture1 = {
    name: 'Service 001 - Test service 1',
    description: 'This is test service 1.',
    baseAddress: 'https://sud.speechlab.sg',
    type: 'SUD',
    endpoints: [endpointFixture1, endpointFixture2],
}

export const serviceFixture2 = {
    name: 'Service 002 - Test service 2',
    description: 'This is test service 2.',
    baseAddress: 'https://example.com/service2',
    type: 'SUD',
    endpoints: [endpointFixture3],
}
