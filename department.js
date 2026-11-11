const departmentView = (() => {
  const department = document.getElementById("department");
  const workstation = document.getElementById("workstation");
  const world = document.getElementById("department-world");
  const notice = document.getElementById("department-notice");
  const action = document.getElementById("department-action");
  const back = document.getElementById("return-to-department");
  const clock = document.getElementById("department-clock");
  const tickets = document.getElementById("department-tickets");
  const dialogue = document.getElementById("department-dialogue");
  const dialogueName = document.getElementById("dialogue-name");
  const dialogueLine = document.getElementById("dialogue-line");
  const dialogueTicket = document.getElementById("dialogue-ticket");
  const engine = shiftEngine;
  let nearby = null;
  let conversationTicket = null;

  function converse(name, line, ticket = null) {
    dialogueName.textContent = name;
    dialogueLine.textContent = line;
    conversationTicket = ticket;
    dialogueTicket.hidden = !ticket;
    dialogue.showModal();
  }

  document.getElementById("dialogue-close").addEventListener("click", () => dialogue.close());
  dialogueTicket.addEventListener("click", () => {
    engine.selectTicket(conversationTicket.id);
    dialogue.close();
    openWorkstation();
  });

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
    if (!department.hidden && !dialogue.open && !engine.state.shiftEnded && nearby) nearby.use();
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
  const sheets = ["technician", "manager", "senior", "warehouse", "employee"];
  const frameWidth = 256;
  const frameHeight = 384;
  const characterScale = 0.20;
  const overheadOffset = Math.ceil(frameHeight * characterScale);
  const directions = ["down", "left", "right", "up"];
  const doorway = [480, 608];
  const centralAisle = [480, 538];
  const visitorSpot = [299, 466];
  const seniorDesk = [257, 192];
  const managerDesk = [267, 372];
  const escalations = new Set(["security", "network", "apps", "dispatch"]);

  class DepartmentScene extends Phaser.Scene {
    preload() {
      this.load.image("room", "assets/room.png");
      for (const sheet of sheets) {
        this.load.spritesheet(sheet, "assets/" + sheet + ".png", { frameWidth, frameHeight });
      }
    }

    createAnimations() {
      for (const sheet of sheets) {
        directions.forEach((direction, row) => {
          this.anims.create({
            key: sheet + "-" + direction,
            frames: this.anims.generateFrameNumbers(sheet, { start: row * 4, end: row * 4 + 3 }),
            frameRate: 9,
            repeat: -1
          });
        });
      }
    }

    pose(actor, dx, dy) {
      if (dx || dy) {
        actor.direction = Math.abs(dy) >= Math.abs(dx)
          ? (dy > 0 ? "down" : "up")
          : (dx > 0 ? "right" : "left");
        actor.sprite.play(actor.sprite.texture.key + "-" + actor.direction, true);
      } else {
        actor.sprite.anims.stop();
        actor.sprite.setFrame(directions.indexOf(actor.direction) * 4);
      }
    }

    createCharacter(sprite) {
      sprite.setOrigin(0.5, 0.96).setScale(characterScale);
      const shadow = this.add.ellipse(sprite.x, sprite.y, 35, 13, 0x111723, 0.47);
      return { sprite, shadow, direction: "down" };
    }

    placeCharacter(actor) {
      const { x, y, alpha } = actor.sprite;
      actor.sprite.setDepth(y);
      actor.shadow.setPosition(x, y - 1).setDepth(y - 1).setAlpha(alpha);
    }

    addCoworker(sheet, label, position, speak) {
      const actor = this.createCharacter(this.add.sprite(...position, sheet, 0));
      actor.label = label;
      actor.use = () => {
        this.pose(actor, this.player.x - actor.sprite.x, this.player.y - actor.sprite.y);
        this.pose(actor, 0, 0);
        speak();
      };
      actor.route = [];
      actor.wait = 0;
      this.coworkers.push(actor);
      this.placeCharacter(actor);
      return actor;
    }

    moveCoworker(actor, elapsed) {
      if (actor.wait > 0) {
        actor.wait -= elapsed;
        return;
      }
      const point = actor.route[0];
      if (!point) return;
      const [x, y, wait = 0] = point;
      const dx = x - actor.sprite.x;
      const dy = y - actor.sprite.y;
      const distance = Math.hypot(dx, dy);
      const step = elapsed * 0.09;
      if (distance <= step) {
        actor.sprite.setPosition(x, y);
        actor.route.shift();
        actor.wait = wait;
        if (wait || !actor.route.length) this.pose(actor, 0, 0);
      } else {
        actor.sprite.setPosition(actor.sprite.x + dx * step / distance, actor.sprite.y + dy * step / distance);
        this.pose(actor, dx, dy);
      }
      if (actor !== this.senior) {
        actor.sprite.setAlpha(Phaser.Math.Clamp((doorway[1] - actor.sprite.y) / 24, 0, 1));
      }
      this.placeCharacter(actor);
    }

    resetCoworkers() {
      for (const actor of this.coworkers) {
        actor.sprite.destroy();
        actor.shadow.destroy();
        actor.indicator?.destroy();
      }
      this.coworkers = [];
      this.visitor = null;
      this.manager = null;
      this.seenVisitors = new Set();
      this.seenUrgent = new Set();
      this.seenEscalations = new Set();
      this.managerWait = 14000;
      this.seniorMessage = "I’ll be between my workstation and the printer if you need a second opinion.";
      this.senior = this.addCoworker("senior", "Senior technician", seniorDesk, () => {
        converse("Senior technician", this.seniorMessage);
      });
      this.senior.wait = 6500;
      this.addCoworker("warehouse", "Warehouse liaison", [616, 365], () => {
        converse("Warehouse liaison", "If a scanner goes down, ask how many stations are affected. One scanner is a very different problem from the whole dock.");
      });
    }

    updateCoworkers(elapsed) {
      const available = engine.availableCases();
      const escalation = available.find((item) => item.status === "resolved"
        && escalations.has(item.resolution) && !this.seenEscalations.has(item.id));
      if (escalation) {
        this.seenEscalations.add(escalation.id);
        this.seniorMessage = "I saw the handoff for “" + escalation.title + ".” I’ll track it with the receiving team.";
        notice.textContent = "Senior technician · " + this.seniorMessage;
      }

      if (!engine.state.shiftEnded && !this.senior.route.length && this.senior.wait <= 0) {
        this.senior.route = [[257, 240], [480, 240], [480, 483], [735, 483, 3500],
          [480, 483], [480, 240], [257, 240], [...seniorDesk, 10000]];
      }

      const urgent = available.find((item) => item.status !== "resolved" && !item.onHold
        && (item.priority === "P1" || item.risk.sla === "Critical") && !this.seenUrgent.has(item.id));
      this.managerWait -= elapsed;
      if (!engine.state.shiftEnded && !this.manager && (urgent || this.managerWait <= 0)) {
        if (urgent) this.seenUrgent.add(urgent.id);
        const meeting = urgent
          ? [Phaser.Math.Clamp(this.player.x, 280, 650), Phaser.Math.Clamp(this.player.y, 235, 560)]
          : managerDesk;
        this.manager = this.addCoworker("manager", "IT manager", doorway, () => {
          converse("IT manager", urgent
            ? "Can you give me an update on “" + urgent.title + "”? Check the impact and response target before you make the call."
            : "I’m checking in on the help desk. Let me know if the queue gets backed up.");
        });
        this.manager.route = [centralAisle, [480, meeting[1]], [...meeting, urgent ? 12000 : 6500],
          [480, meeting[1]], centralAisle, doorway];
        this.manager.leaving = true;
      }

      const walkUp = available.find((item) => item.channel === "Walk-up" && item.status !== "resolved"
        && !this.seenVisitors.has(item.id));
      if (!engine.state.shiftEnded && !this.visitor && walkUp) {
        const sheet = /warehouse/i.test(walkUp.department) ? "warehouse" : "employee";
        const visitor = this.addCoworker(sheet, walkUp.requester, doorway, () => {
          const message = visitor.outcome || (walkUp.onHold
            ? "I’ll wait here while you follow up."
            : walkUp.report);
          converse(walkUp.requester, message, visitor.outcome ? null : walkUp);
        });
        visitor.ticket = walkUp;
        visitor.route = [centralAisle, [480, visitorSpot[1]], visitorSpot];
        visitor.indicator = this.add.circle(0, 0, 3.5, 0x8af1d1).setStrokeStyle(1, 0x152630).setDepth(990);
        this.seenVisitors.add(walkUp.id);
        this.visitor = visitor;
      }

      for (const actor of this.coworkers) this.moveCoworker(actor, elapsed);
      if (this.manager?.leaving && !this.manager.route.length) {
        this.removeCoworker(this.manager);
        this.manager = null;
        this.managerWait = 27000;
      }
      if (this.visitor) this.updateVisitor();
    }

    updateVisitor() {
      const visitor = this.visitor;
      const { ticket, sprite, indicator } = visitor;
      if (visitor.leaving && !visitor.route.length) {
        this.removeCoworker(visitor);
        this.visitor = null;
        return;
      }
      const waiting = !visitor.route.length;
      indicator.setPosition(sprite.x, sprite.y - overheadOffset).setVisible(waiting && !visitor.leaving);
      if (visitor.leaving || !waiting || (!engine.state.shiftEnded && ticket.status !== "resolved")) return;
      if (ticket.status !== "resolved") {
        visitor.outcome = "I still need help with this. I’ll check back next shift.";
      } else if (ticket.quality !== "Clean") {
        visitor.outcome = "I’m frustrated this still isn’t sorted out. I’ll follow up if I need more help.";
      } else if (escalations.has(ticket.resolution)) {
        visitor.outcome = "Thanks for getting this to the right team. I’ll wait for their follow-up.";
      } else if (ticket.resolution === "deny") {
        visitor.outcome = "Understood. I’ll come back with the required approval.";
      } else {
        visitor.outcome = "Thanks for your help!";
      }
      notice.textContent = ticket.requester + " · " + visitor.outcome;
      visitor.wait = 4200;
      visitor.route = [[480, visitorSpot[1]], centralAisle, doorway];
      visitor.leaving = true;
    }

    removeCoworker(actor) {
      actor.sprite.destroy();
      actor.shadow.destroy();
      actor.indicator?.destroy();
      this.coworkers = this.coworkers.filter((coworker) => coworker !== actor);
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

      this.player = this.physics.add.sprite(...spawn, "technician", 0);
      this.playerCharacter = this.createCharacter(this.player);
      this.placeCharacter(this.playerCharacter);
      this.createAnimations();
      this.player.body.setSize(96, 52).setOffset(80, 316);
      this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, obstacles);
      this.coworkers = [];
      this.resetCoworkers();
      dialogue.addEventListener("close", () => {
        this.input.keyboard.resetKeys();
        if (!department.hidden) world.focus();
      });
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
          this.playerCharacter.direction = "down";
          this.pose(this.playerCharacter, 0, 0);
          this.placeCharacter(this.playerCharacter);
          this.resetCoworkers();
        }
      });
      syncPhone();
      if (!department.hidden) world.focus({ preventScroll: true });
    }

    update(_time, delta) {
      if (!department.hidden && !dialogue.open) this.updateCoworkers(Math.min(delta, 50));
      const blocked = department.hidden || engine.state.shiftEnded
        || dialogue.open || document.querySelector(".modal-backdrop:not(.hidden)");
      if (blocked) {
        this.player.setVelocity(0);
        this.pose(this.playerCharacter, 0, 0);
        return;
      }
      const { W, A, S, D, UP, DOWN, LEFT, RIGHT, E } = this.keys;
      const dx = Number(D.isDown || RIGHT.isDown) - Number(A.isDown || LEFT.isDown);
      const dy = Number(S.isDown || DOWN.isDown) - Number(W.isDown || UP.isDown);
      this.player.setVelocity(dx, dy);
      this.player.body.velocity.normalize().scale(175);
      this.pose(this.playerCharacter, dx, dy);
      this.placeCharacter(this.playerCharacter);

      let closest = null;
      let distance = 54;
      const px = this.player.body.center.x;
      const py = this.player.body.center.y;
      for (const object of objects) {
        const [x, y] = object.at;
        const gap = Math.hypot(px - x * artScale, py - y * artScale);
        if (gap < distance) {
          closest = object;
          distance = gap;
        }
      }
      for (const actor of this.coworkers) {
        if (actor.sprite.alpha < 0.8 || (actor === this.visitor && actor.route.length && !actor.wait)) continue;
        const gap = Math.hypot(px - actor.sprite.x, py - actor.sprite.y);
        if (gap < Math.min(distance, 39)) {
          closest = actor;
          distance = gap;
        }
      }
      if (nearby !== closest) {
        nearby = closest;
        action.disabled = !nearby;
        action.textContent = nearby ? nearby.label : "Approach an object";
        this.marker.setText(nearby ? "E · " + nearby.label : "");
      }
      this.marker.setPosition(Phaser.Math.Clamp(this.player.x, 145, 815), this.player.y - overheadOffset).setVisible(Boolean(nearby));
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
