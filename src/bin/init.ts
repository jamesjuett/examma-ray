#!/usr/bin/env node

import { ncp } from "ncp";
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