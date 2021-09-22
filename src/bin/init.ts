#!/usr/bin/env node

import { existsSync, writeFileSync } from "fs";
import { ncp } from "ncp";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import process from "process";

function examma_ray_init(base_dir: string) {
  console.log("Initializing directory structure from template exam...")
  try {
    ncp(
      path.join(__dirname, "../../template/content"), // src
      "content", // dest
      { // options
        clobber: false
      },
      (err) => { // callback
        if (!err) {
          ncp(
            path.join(__dirname, "../../template/template_exam"), // src
            base_dir, // dest
            { // options
              clobber: false
            },
            (err) => { // callback
              if (!err) {
                if (!existsSync(`${base_dir}/scripts/secret`)) {
                  console.log("Generating exam generation secret...")
                  writeFileSync(`${base_dir}/secret`, uuidv4(), {encoding: "utf8"});
                }
                console.log("Template exam initialized successfully.")
              }
              else {
                console.error(err);
              }
            }
          )
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

const base_dir = process.argv[2] ?? "template_exam";
examma_ray_init(base_dir);