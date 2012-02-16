node-gyp
=========
### Node.js native addon build tool

`node-gyp` is a cross-platform command-line tool written in Node.js for compiling
native addon modules for Node.js, which takes away the pain of dealing with the
various differences in build platforms. It is the replacement to the `node-waf`
program which is removed for node `v0.8`. If you have a native addon for node that
still has a `wscript` file, then you should definitely add a `bindings.gyp` file
to support the latest versions of node.

Multiple target versions of node are supported (i.e. `0.7`, `0.8`, `1.0`, etc.),
regardless of what version of node is actually installed on your system
(`node-gyp` downloads the necessary development files for the target version).

#### Features:

 * Easy to use, consistent interface
 * Same commands to build your module on every platform
 * Supports multiple target versions of Node


Installation
------------

To install with `npm`, invoke:

``` bash
$ npm install -g node-gyp
```

You will also need to install:

  * On Unix
    * `python`
    * `make`
    * A proper C/C++ compiler toolchain, like GCC
  * On Windows
    * [Python][windows-python]
    * Microsoft Visual C++ ([Express][msvc] version works well)

How to Use
----------

To compile your native addon, first go to its root directory:

``` bash
$ cd my_node_addon
```

From here, you can invoke the `node-gyp` executable. The next step is to generate
the appropriate project build files for the current platform. Use `configure` for
that:

``` bash
$ node-gyp configure
```

__Note__: The `configure` step looks for the first `.gyp` file in the current
directory to processs. See below for instructions on creating the `.gyp` file.

Now you will have either a `Makefile` (on Unix platforms) or a
`vcxproj` file (on Windows) in the current directory. Next invoke the `build`
step:

``` bash
$ node-gyp build
```

Now you have your compiled `.node` bindings file! The compiled bindings end up in
`out/Debug` or `out/Release`, depending on the build mode. At this point you can
require the `.node` file with Node and run your tests!

__Note:__ To create a _Debug_ build of the bindings file, pass the `--debug` (or
`-d`) switch to `build`.

-------------------

__(Optional)__ Copy the compiled bindings into an appropriate directory for
runtime loading detection (with [node-bindings][]), using the `copy` command:

``` bash
$ node-gyp copy
```

So for example, if you are on a 64-bit OS X machine and your target node version
is `0.7`, then the `copy` command above would copy the bindings from
`out/Release/bindings.node` to `compiled/0.7/darwin/x64/bindings.node`.


The "gyp" file
--------------

Previously when node had `node-waf` you had to write a `wscript` file. The
replacement for that is the `bindings.gyp` file, which describes the configuration
to build your module in a JSON-like format. A barebones `gyp` file appropriate for
building a node addon looks like:

``` json
{
  'targets': [
    {
      'target_name': 'bindings',
      'sources': [ 'src/bindings.cc' ]
    }
  ]
}
```

Some additional resources:

 * ["Hello World" node addon example](https://github.com/joyent/node/tree/master/test/addons/hello-world)
 * [gyp user documentation](http://code.google.com/p/gyp/wiki/GypUserDocumentation)
 * [gyp input format reference](http://code.google.com/p/gyp/wiki/InputFormatReference)


Commands
--------

`node-gyp` responds to the following commands:

 * `build` - Invokes `make`/`msbuild.exe` and builds the native addon
 * `clean` - Removes any generated project files and the `out` dir
 * `configure` - Generates project build files for the current platform
 * `copy` - Copies a compiled bindings to an appropriate dir for runtime detection
 * `install` - Installs node development files for the given version.  Respects http_proxy/HTTP_PROXY and --proxy=<proxyurl> when downloading.
 * `list` - Lists the currently installed node development file versions
 * `remove` - Removes a node development files for a given version


License
-------

(The MIT License)

Copyright (c) 2012 Nathan Rajlich &lt;nathan@tootallnate.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[windows-python]: http://www.python.org/getit/windows
[msvc]: http://www.microsoft.com/visualstudio/en-us/products/2010-editions/visual-cpp-express
[node-bindings]: https://github.com/TooTallNate/node-bindings
