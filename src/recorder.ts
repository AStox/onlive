/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

"use strict";

/* globals main */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

/* globals main, MediaRecorder */

export class Recorder {
  canvas: HTMLCanvasElement;
  mediaRecorder: MediaRecorder;
  recordedBlobs: any[];
  sourceBuffer: SourceBuffer;
  mediaSource: MediaSource;
  stream: MediaStream;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.recordedBlobs = [];
    this.mediaSource = new MediaSource();
    this.mediaSource.addEventListener("sourceopen", this.handleSourceOpen, false);
    this.stream = this.canvas.captureStream(); // frames per second
    console.log("Started stream capture from canvas element: ", this.stream);
  }

  handleSourceOpen(event: Event) {
    console.log("MediaSource opened");
    this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log("Source buffer: ", this.sourceBuffer);
  }

  record() {
    console.log("Starting recording");
    this.startRecording();
    setTimeout(() => {
      this.stopRecording();
      this.download();
    }, 7000);
  }

  // The nested try blocks will be simplified when Chrome 47 moves to Stable
  startRecording() {
    console.log("googoo");
    let options: any = { mimeType: "video/webm" };
    this.recordedBlobs = [];
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e0) {
      console.log("Unable to create MediaRecorder with options Object: ", e0);
      try {
        options = { mimeType: "video/webm,codecs=vp9" };
        this.mediaRecorder = new MediaRecorder(this.stream, options);
      } catch (e1) {
        console.log("Unable to create MediaRecorder with options Object: ", e1);
        try {
          options = "video/vp8"; // Chrome 47
          this.mediaRecorder = new MediaRecorder(this.stream, options);
        } catch (e2) {
          alert(
            "MediaRecorder is not supported by this browser.\n\n" +
              "Try Firefox 29 or later, or Chrome 47 or later, " +
              "with Enable experimental Web Platform features enabled from chrome://flags."
          );
          console.error("Exception while creating MediaRecorder:", e2);
          return;
        }
      }
    }
    console.log("Created MediaRecorder", this.mediaRecorder, "with options", options);
    this.mediaRecorder.ondataavailable = (event: any) => {
      console.log("ondataavailable recordedBlobs: ", this.recordedBlobs);
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };
    this.mediaRecorder.start(100); // collect 100ms of data
    console.log("MediaRecorder started", this.mediaRecorder);
  }

  stopRecording() {
    this.mediaRecorder.stop();
    console.log("Stopped! Recorded Blobs: ", this.recordedBlobs);
  }

  download() {
    const blob = new Blob(this.recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "test.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
