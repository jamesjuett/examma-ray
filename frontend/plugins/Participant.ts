import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { DateTime } from "luxon";
import { AssignedExam } from "../../src/core/assigned_exams";
import { ICON_BOX, ICON_BOX_CHECK, ICON_BOX_DASH, ICON_EXCLAMATION_TRIANGLE_FILL, ICON_SCALE } from "../../src/core/icons";
import { assert, assertNever } from "../../src/core/util";

export type User = {
  email: string,
  participation_token: string,
};

function decodeUser(participation_token: string) : User {
  const decoded = jwtDecode(participation_token);
  assert(decoded.sub);
  return {
    participation_token: participation_token,
    email: decoded.sub
  };
}

const PARTICIPATION_TOKEN_LOCAL_STORAGE_KEY = "examma-ray-participation-token";

export class Participant {

  public readonly assigned_exam: AssignedExam;
  public server_status: "ok" | "error" = "ok";
  public user?: User;

  private callbacks: ((participant: Participant) => void)[] = [];

  public constructor(assigned_exam: AssignedExam) {
    this.assigned_exam = assigned_exam;

    const participation_token = localStorage.getItem(PARTICIPATION_TOKEN_LOCAL_STORAGE_KEY);
    if (participation_token) {
      this.setUser(participation_token);
    }
  }

  private async setUser(participation_token: string) {
    this.user = decodeUser(participation_token);
    $("#examma-ray-exam-sign-in-button > span").html(this.user.email);
    $("#exam-sign-in-modal").modal("hide");
    this.callbacks.forEach(callback => callback(this));
  }

  private removeUser() {
    delete this.user;
    $("#examma-ray-exam-sign-in-button > span").html(`Sign In`);
    this.callbacks.forEach(callback => callback(this));
  }

  public async signIn(google_id_token: string, endpoint: string) {

    localStorage.removeItem(PARTICIPATION_TOKEN_LOCAL_STORAGE_KEY);
    this.removeUser();

    try {
      const auth_response = await axios({
        url: endpoint,
        method: "POST",
        headers: {
          "Authorization": google_id_token
        }
      });
      
      if (auth_response.status === 201) {
        const participation_token = auth_response.data.participation_token;
        if (participation_token && participation_token !== "") {
          localStorage.setItem(PARTICIPATION_TOKEN_LOCAL_STORAGE_KEY, participation_token);
          await this.setUser(participation_token);
        }
      }
    }
    catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 403) {
          localStorage.removeItem(PARTICIPATION_TOKEN_LOCAL_STORAGE_KEY);
          this.removeUser();
        }
        else {
          this.server_status = "error";
        }
      }
      else {
        this.server_status = "error";
        throw e;
      }
    }
  }

  public onUserChange(callback: (participant : Participant) => void) {
    this.callbacks.push(callback);
  }

};