import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import {jest} from "jest";

import LoginPage from "../pages/LoginPage";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

const mockAuth = jest.mocked(useAuth);

describe("LoginPage", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockReturnValue({
            login: jest.fn().mockResolveValue(undefined),
            isLoading: false,
        } as ReturnType<typeof useAuth>);

    });


    function renderPage() {
        return render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )
    }

});