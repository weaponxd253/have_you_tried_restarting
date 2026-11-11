const departmentView = (() => {
  const department = document.getElementById("department");
  const workstation = document.getElementById("workstation");
  const world = document.getElementById("department-world");
  const notice = document.getElementById("department-notice");
  const action = document.getElementById("department-action");
  const back = document.getElementById("return-to-department");
  const clock = document.getElementById("department-clock");
  const tickets = document.getElementById("department-tickets");
  const engine = shiftEngine;
  let nearby = null;

  function show() {
    department.hidden = false;
    workstation.hidden = true;
    window.scrollTo(0, 0);
    world.focus();
  }

  function openWorkstation() {
    department.hidden = true;
    workstation.hidden = false;
    window.scrollTo(0, 0);
    back.focus();
  }

  function updateHud() {
    clock.textContent = engine.formatTime(engine.state.time);
    tickets.textContent = engine.openCases().length;
    const latest = engine.state.feed[0];
    notice.textContent = latest ? latest.title + " · " + latest.text : "";
  }

  function phone() {
    if (!engine.availableCases().length) engine.waitForWork();
    const call = engine.queueOrder(engine.openCases()).active
      .find((ticket) => ticket.channel === "Phone" && !ticket.onHold);
    if (!call) {
      notice.textContent = "No calls waiting. Check the workstation for other tickets.";
      return;
    }
    engine.selectTicket(call.id);
    openWorkstation();
  }

  const objects = [
    ...[393, 648, 913].map((y) => ({
      label: "Technician’s workstation", at: [208, y], use: openWorkstation
    })),
    { label: "Help-desk phone", at: [363, 290], use: phone },
    { label: "Printer", at: [1105, 682], use() {
      notice.textContent = "Printer ready. No jobs in the print queue.";
    } },
    { label: "Equipment cabinet", at: [1240, 441], use() {
      notice.textContent = Object.values(engine.state.resources)
        .map((resource) => resource.label + " " + resource.remaining + "/" + resource.max)
        .join(" · ");
    } },
    { label: "Department exit · End shift", at: [724, 898], use: () => engine.endShift() }
  ];

  function interact() {
    if (!department.hidden && nearby) nearby.use();
  }

  back.addEventListener("click", show);
  action.addEventListener("click", interact);
  engine.subscribe((type) => {
    if (type === "change") updateHud();
  });
  updateHud();

  if (!window.Phaser) {
    notice.textContent = "The department could not load. You can still play the shift at the workstation.";
    action.disabled = false;
    action.textContent = "Open workstation";
    action.addEventListener("click", openWorkstation);
    return { show };
  }

  const width = 960;
  const height = 720;
  const artScale = width / 1448;
  // Collision rectangles are measured in the room artwork's 1448 × 1086 coordinates.
  const footprints = [
    [0, 0, 1448, 254], [0, 254, 22, 832], [1416, 254, 32, 832],
    [0, 968, 1448, 118], [588, 895, 270, 73],
    [511, 940, 77, 28], [858, 940, 77, 28],
    [22, 254, 349, 138], [22, 444, 349, 201], [22, 705, 349, 207],
    [402, 254, 265, 74],
    [1030, 254, 154, 193], [1189, 254, 100, 189], [1293, 254, 123, 405],
    [1038, 471, 155, 212], [1201, 515, 87, 168],
    [1254, 680, 67, 202], [1321, 705, 95, 173]
  ];
  const spawn = [480, 411];
  const frameSize = 32;
  const directions = ["down", "left", "right", "up"];

  class DepartmentScene extends Phaser.Scene {
    preload() {
      this.load.image("room", "assets/room.png");
    }

    createPlaceholder() {
      // Four rows in down, left, right, up order, with four 32×32 frames per row.
      const sheet = this.textures.createCanvas("technician-sheet", frameSize * 4, frameSize * 4);
      const ctx = sheet.context;
      directions.forEach((direction, row) => {
        for (let frame = 0; frame < 4; frame++) {
          const x = frame * frameSize;
          const y = row * frameSize;
          const stride = [0, -2, 0, 2][frame];
          ctx.fillStyle = "#172434";
          ctx.fillRect(x + 9, y + 22, 5, 8 + stride);
          ctx.fillRect(x + 18, y + 22, 5, 8 - stride);
          ctx.fillStyle = "#63d5eb";
          ctx.fillRect(x + 7, y + 13, 18, 11);
          ctx.fillStyle = "#edbf91";
          ctx.fillRect(x + 10, y + 4, 12, 11);
          ctx.fillStyle = "#273c53";
          ctx.fillRect(x + 10, y + 3, 12, direction === "up" ? 12 : 4);
          if (direction !== "up") {
            const eyes = { left: [11], right: [20], down: [12, 19] };
            eyes[direction].forEach((eye) => ctx.fillRect(x + eye, y + 9, 2, 2));
          }
          sheet.add(row * 4 + frame, 0, x, y, frameSize, frameSize);
        }
        this.anims.create({
          key: "walk-" + direction,
          frames: Array.from({ length: 4 }, (_, frame) => ({ key: "technician-sheet", frame: row * 4 + frame })),
          frameRate: 9,
          repeat: -1
        });
      });
      sheet.refresh();
    }

    create() {
      this.add.image(0, 0, "room").setOrigin(0).setDisplaySize(width, height);
      const obstacles = footprints.map((bounds) => {
        const [x, y, w, h] = bounds.map((value) => value * artScale);
        const zone = this.add.zone(x, y, w, h).setOrigin(0);
        this.physics.add.existing(zone, true);
        return zone;
      });
      const callIndicator = this.add.circle(326 * artScale, 252 * artScale, 5, 0x74f7ab)
        .setStrokeStyle(2, 0x132335).setDepth(999);

      this.createPlaceholder();
      this.player = this.physics.add.sprite(...spawn, "technician-sheet", 0).setOrigin(0.5, 0.5);
      this.player.body.setSize(16, 10).setOffset(8, 20);
      this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, obstacles);
      this.direction = "down";
      this.marker = this.add.text(0, 0, "", {
        fontFamily: "monospace", fontSize: "17px", color: "#e8fbff",
        backgroundColor: "#131f30", padding: { x: 9, y: 5 }
      }).setOrigin(0.5, 1).setDepth(1000);
      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E", false);
      this.input.keyboard.enabled = !department.hidden;
      const onViewChange = () => {
        this.input.keyboard.enabled = !department.hidden;
        this.input.keyboard.resetKeys();
        this.player.setVelocity(0);
        if (!department.hidden) this.scale.refresh();
      };
      new MutationObserver(onViewChange).observe(department, { attributes: true, attributeFilter: ["hidden"] });
      const syncPhone = () => {
        const waiting = engine.openCases().some((ticket) => ticket.channel === "Phone" && !ticket.onHold);
        callIndicator.setVisible(waiting);
      };
      engine.subscribe((type) => {
        if (type === "change") syncPhone();
        if (type === "restart") {
          this.player.body.reset(...spawn);
          this.direction = "down";
        }
      });
      syncPhone();
    }

    update() {
      const blocked = department.hidden || engine.state.shiftEnded
        || document.querySelector(".modal-backdrop:not(.hidden)");
      if (blocked) {
        this.player.setVelocity(0);
        return;
      }
      const { W, A, S, D, UP, DOWN, LEFT, RIGHT, E } = this.keys;
      const dx = Number(D.isDown || RIGHT.isDown) - Number(A.isDown || LEFT.isDown);
      const dy = Number(S.isDown || DOWN.isDown) - Number(W.isDown || UP.isDown);
      this.player.setVelocity(dx, dy);
      this.player.body.velocity.normalize().scale(175);
      if (dx || dy) {
        this.direction = dy ? (dy > 0 ? "down" : "up") : (dx > 0 ? "right" : "left");
        this.player.play("walk-" + this.direction, true);
      } else {
        this.player.anims.stop();
        this.player.setFrame(directions.indexOf(this.direction) * 4);
      }
      this.player.setDepth(this.player.body.bottom);

      let closest = null;
      let distance = 54;
      for (const object of objects) {
        const [x, y] = object.at;
        const px = this.player.body.center.x;
        const py = this.player.body.center.y;
        const gap = Math.hypot(px - x * artScale, py - y * artScale);
        if (gap < distance) {
          closest = object;
          distance = gap;
        }
      }
      if (nearby !== closest) {
        nearby = closest;
        action.disabled = !nearby;
        action.textContent = nearby ? nearby.label : "Approach an object";
        this.marker.setText(nearby ? "E · " + nearby.label : "");
      }
      this.marker.setPosition(Phaser.Math.Clamp(this.player.x, 145, 815), this.player.y - 23).setVisible(Boolean(nearby));
      if (Phaser.Input.Keyboard.JustDown(E)) interact();
    }
  }

  world.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
  });
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: world,
    width,
    height,
    pixelArt: true,
    loader: { imageLoadType: "HTMLImageElement" },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: "arcade" },
    scene: DepartmentScene
  });
  return { show };
})();
