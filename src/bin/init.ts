#!/usr/bin/env node

import { existsSync, writeFileSync } from "fs";
import { ncp } from "ncp";
import { v4 as uuidv4 } from 'uuid';
import path from "path";

function examma_ray_init() {
  console.log("Initializing directory structure from template exam...")
  try {
    ncp(
      path.join(__dirname, "../../template/"), // src
      ".", // dest
      { // options
        clobber: false
      },
      (err) => { // callback
        if (!err) {
          if (!existsSync("template_exam/scripts/secret")) {
            console.log("Generating exam generation secret...")
            writeFileSync("template_exam/secret", uuidv4(), {encoding: "utf8"});
          }
          console.log("Template exam initialized successfully.")
        }
        else {
          console.error(err);
        }
      }
    )
  }
  catch(e: any) {
    if (e.code === "MODULE_NOT_FOUND") {
      console.error("Error: Cannot find template exam files.");
    }
    else {
      throw e;
    }
  }
}

examma_ray_init();