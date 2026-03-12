# OSI Model

## What the OSI Model is?

The OSI model is a conceptual framework that explains how data moves from one computer to another across a network.

- It was created by the [International Organization for Standardization](https://www.iso.org/home.html).
- It divides network communication into 7 layers.
- Each layer has a specific job in sending and receiving data.

Think of it like sending a package through the mail:

1. You write the message.
2. You put it in an envelope.
3. The post office sorts it.
4. It gets transported.
5. The receiver gets it and opens it.

Each step is handled separately, just like the OSI layers.

## Why it uses layers

The model splits a complex process into smaller parts.

Instead of one giant system handling everything, the OSI model breaks networking into 7 stacked layers, where:

- Each layer performs a specific function
- Each layer communicates with the layer above and below it

This makes networking easier to design, understand and troubleshoot.

## Why the OSI model matters?

Even though modern networks mostly use the TCP/IP model instead of OSI directly, the OSI model is still important for several reasons.

### Easier troubleshooting

If something breaks in a network, eengineers can check layer by layer to find the problem.

Example:

- Physical cable issue, physical layer
- IP address problem, network layer

### Common language for networking

The OSI model created standard terminology used by network engineers.

People can say things like:

- This is a layer 3 problem
- Firewall works at layer 4

This makes everyone understand the mean.

### Compatibility between devices

It helps companies design devices that work together, even if they are made by different manufactures.

For example:

- Routers
- Switches
- Firewalls
- Network cards

### Helps with security thinking

Security professionals analyze threats layer by layer, which helps identify where attacks happen.

Example:

- Malware in applications, applications layer
- Packet manipulation, network layer

### Simplifies complex networking

Networking is extremely complex. The OSI model makes it easier to study and understand by dividing it into smaller pieces
