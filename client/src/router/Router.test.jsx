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
  const MockParams2 = ({ params }) => (
    <>
      <h1>Params</h1>
      <div>
        {params.first}+{params.second}
      </div>
    </>
  );
  const MockParams1 = ({ params }) => (
    <>
      <h1>Params</h1>
      <div>{params.first}</div>
    </>
  );

  const routes = [
    { "/": MockHome },
    { "/somepage": MockSomepage },
    { "/links": MockLinks },
    { "/params/:first/:second": MockParams2 },
    { "/one/two/three/:first": MockParams1 },
  ];

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

  it("Link component updates location", async () => {
    window.history.pushState({}, "", "/links");
    render(<Router routes={routes} />);
    expect(screen.getByText("Links Page")).toBeInTheDocument();
    await act(async () => {
      screen.getByText("home").click();
    });

    expect(await screen.findByText("Home Page")).toBeInTheDocument();
  });

  it("Single path params in url", async () => {
    render(<Router routes={routes} />);
    expect(screen.getByText("Home Page")).toBeInTheDocument();
    await act(async () => {
      navigate("/one/two/three/foobar");
    });
    expect(await screen.findByText("foobar")).toBeInTheDocument();
  });

  it("Multiple paths params in url", async () => {
    render(<Router routes={routes} />);
    expect(screen.getByText("Home Page")).toBeInTheDocument();
    await act(async () => {
      navigate("/params/two/three");
    });
    expect(await screen.findByText("two+three")).toBeInTheDocument();
  });

  it("Params should miss path that's too long", async () => {
    render(<Router routes={routes} />);
    expect(screen.getByText("Home Page")).toBeInTheDocument();
    await act(async () => {
      navigate("/params/two/three/foo/bar");
    });
    expect(await screen.findByText("Not found")).toBeInTheDocument();
  });
});
