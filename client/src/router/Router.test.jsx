import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { Link, Router } from "./Router";
import { navigate } from "./navigate";

describe("Router", () => {
  beforeEach(() => {
    // Reset the URL before each test
    window.history.pushState({}, "", "/");
  });

  const MockHome = () => <h1>Home Page</h1>;
  const MockSomepage = () => <h1>Somepage Page</h1>;
  const MockLinks = () => (
    <>
      <h1>Links Page</h1>
      <Link href="/">home</Link>
    </>
  );

  const routes = {
    "/": MockHome,
    "/somepage": MockSomepage,
    "/links": MockLinks,
  };

  it("renders Home page for '/' path", () => {
    render(<Router routes={routes} />);
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("renders NotFound for unknown path", () => {
    window.history.pushState({}, "", "/unknown");
    render(<Router routes={routes} />);
    expect(screen.getByText("Not found")).toBeInTheDocument();
  });

  it("navigate function updates location", async () => {
    render(<Router routes={routes} />);
    expect(screen.getByText("Home Page")).toBeInTheDocument();
    await act(async () => {
      navigate("/somepage");
    });
    expect(screen.getByText("Somepage Page")).toBeInTheDocument();
  });

  // TODO : znichola - fix the test before merging branch
  // it("Link component updates location", async () => {
  //   render(<Router routes={routes} />);
  //   expect(screen.getByText("Home Page")).toBeInTheDocument();
  //   await act(async () => {
  //     navigate('/links');
  //   });
  //   expect(screen.getByText("Links Page")).toBeInTheDocument();
  //   await act(async () => {
  //     console.log("Path before click:", window.location.pathname);
  //     screen.getByText("home").click();
  //     console.log("Path after click:", window.location.pathname);
  //   });
  //   expect(await screen.findByText("Home Page")).toBeInTheDocument();
  // });
});
