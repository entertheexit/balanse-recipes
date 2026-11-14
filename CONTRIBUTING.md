# Contributing

Submit recipe changes through a pull request. Keep existing recipe and institution IDs stable; increase the recipe version for every behavior change. Update its catalog revision, content hash and change summary. New institution IDs must be country-qualified. Declare all required parser capabilities; unsupported formats need application parser work before publication.

Include synthetic input and expected output fixtures for changed parsing behavior. Do not contribute real statements, screenshots, passwords, account numbers, copied transaction rows, or identifiable customer data. Describe the synthetic fixture's coverage in the pull request. Maintainers must run parser conformance in Balanse before marking the recipe supported.

Contributions are licensed under MIT. Importing a custom recipe into Balanse is private and does not submit it to this repository.
