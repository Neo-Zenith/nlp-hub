import { createMock } from '@golevelup/ts-jest'
import { CustomRequest } from 'src/common/request/request.model'

export const mockRequestObject = () => {
    return createMock<CustomRequest>({
        payload: jest.fn().mockReturnThis(),
        body: jest.fn().mockReturnThis(),
    })
}
